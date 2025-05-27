const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

// Inicializar Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Registrar um novo token FCM
 */
exports.registerFCMToken = onCall(async (request) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { token, deviceInfo } = data;
    
    if (!token) {
      throw new HttpsError('invalid-argument', 'Token FCM é obrigatório');
    }

    console.log('📱 Registrando token FCM:', {
      userId: auth.uid,
      tokenPreview: token.substring(0, 40) + '...',
      deviceInfo
    });

    // Verificar se o token já existe
    const existingTokenQuery = await db.collection('fcm_tokens')
      .where('token', '==', token)
      .where('userId', '==', auth.uid)
      .limit(1)
      .get();

    let tokenDoc;
    
    if (!existingTokenQuery.empty) {
      // Token já existe, atualizar
      tokenDoc = existingTokenQuery.docs[0];
      await tokenDoc.ref.update({
        lastUsed: admin.firestore.FieldValue.serverTimestamp(),
        deviceInfo: deviceInfo || {},
        isValid: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Token existente atualizado');
    } else {
      // Criar novo token
      const tokenData = {
        userId: auth.uid,
        token,
        deviceInfo: deviceInfo || {},
        isValid: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUsed: admin.firestore.FieldValue.serverTimestamp(),
        storeSubscriptions: []
      };

      tokenDoc = await db.collection('fcm_tokens').add(tokenData);
      console.log('✅ Novo token criado:', tokenDoc.id);
    }

    return {
      success: true,
      tokenId: tokenDoc.id,
      message: 'Token FCM registrado com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro ao registrar token FCM:', error);
    throw new HttpsError('internal', 'Erro interno: ' + error.message);
  }
});

/**
 * Obter todos os tokens do usuário atual
 */
exports.getMyTokens = onCall(async (request) => {
  try {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    console.log('📋 Buscando tokens do usuário:', auth.uid);

    const tokensSnapshot = await db.collection('fcm_tokens')
      .where('userId', '==', auth.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const tokens = tokensSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt,
      lastUsed: doc.data().lastUsed
    }));

    console.log(`📱 ${tokens.length} tokens encontrados`);

    return tokens;

  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    throw new HttpsError('internal', 'Erro interno: ' + error.message);
  }
});

/**
 * Gerar novos tokens FCM (limpar antigos e permitir geração de novos)
 */
exports.generateNewTokens = onCall(async (request) => {
  try {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    console.log('🔄 Gerando novos tokens para usuário:', auth.uid);

    // 1. Marcar todos os tokens existentes como inválidos
    const existingTokensSnapshot = await db.collection('fcm_tokens')
      .where('userId', '==', auth.uid)
      .get();

    const batch = db.batch();
    let invalidatedCount = 0;

    existingTokensSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isValid: false,
        invalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
        invalidationReason: 'user_requested_new_tokens'
      });
      invalidatedCount++;
    });

    if (invalidatedCount > 0) {
      await batch.commit();
      console.log(`✅ ${invalidatedCount} tokens antigos invalidados`);
    }

    // 2. Criar registro de solicitação de novos tokens
    await db.collection('token_generation_requests').add({
      userId: auth.uid,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      oldTokensInvalidated: invalidatedCount,
      status: 'pending'
    });

    return {
      success: true,
      message: 'Tokens antigos invalidados. Configure novamente as notificações.',
      invalidatedTokens: invalidatedCount,
      action: 'reconfigure_notifications'
    };

  } catch (error) {
    console.error('❌ Erro ao gerar novos tokens:', error);
    throw new HttpsError('internal', 'Erro interno: ' + error.message);
  }
});

/**
 * Apagar tokens específicos ou todos do usuário
 */
exports.deleteTokens = onCall(async (request) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { tokenIds, deleteAll } = data;

    console.log('🗑️ Apagando tokens:', { tokenIds, deleteAll, userId: auth.uid });

    let tokensToDelete;

    if (deleteAll) {
      // Apagar todos os tokens do usuário
      tokensToDelete = await db.collection('fcm_tokens')
        .where('userId', '==', auth.uid)
        .get();
    } else if (tokenIds && Array.isArray(tokenIds)) {
      // Apagar tokens específicos
      const tokenPromises = tokenIds.map(tokenId => 
        db.collection('fcm_tokens').doc(tokenId).get()
      );
      
      const tokenDocs = await Promise.all(tokenPromises);
      
      // Filtrar apenas tokens que existem e pertencem ao usuário
      tokensToDelete = {
        docs: tokenDocs.filter(doc => 
          doc.exists && doc.data().userId === auth.uid
        )
      };
    } else {
      throw new HttpsError('invalid-argument', 'tokenIds deve ser um array ou deleteAll deve ser true');
    }

    if (tokensToDelete.docs.length === 0) {
      return {
        success: true,
        message: 'Nenhum token encontrado para apagar',
        deletedCount: 0
      };
    }

    // Apagar tokens em batch
    const batch = db.batch();
    tokensToDelete.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    const deletedCount = tokensToDelete.docs.length;
    console.log(`✅ ${deletedCount} tokens apagados`);

    // Registrar a exclusão
    await db.collection('token_deletion_logs').add({
      userId: auth.uid,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedCount,
      deleteAll: !!deleteAll,
      tokenIds: deleteAll ? null : tokenIds
    });

    return {
      success: true,
      message: `${deletedCount} token(s) apagado(s) com sucesso`,
      deletedCount
    };

  } catch (error) {
    console.error('❌ Erro ao apagar tokens:', error);
    throw new HttpsError('internal', 'Erro interno: ' + error.message);
  }
});

/**
 * Verificar validade de tokens (função de manutenção)
 */
exports.validateTokens = onCall(async (request) => {
  try {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    console.log('🔍 Verificando validade dos tokens para:', auth.uid);

    const tokensSnapshot = await db.collection('fcm_tokens')
      .where('userId', '==', auth.uid)
      .where('isValid', '==', true)
      .get();

    const validationResults = [];
    const messaging = getMessaging();

    for (const doc of tokensSnapshot.docs) {
      const tokenData = doc.data();
      
      try {
        // Tentar enviar uma mensagem de teste (dry run)
        await messaging.send({
          token: tokenData.token,
          notification: {
            title: 'Teste de Validação',
            body: 'Este é um teste interno'
          }
        }, true); // dry run = true
        
        validationResults.push({
          tokenId: doc.id,
          valid: true,
          tested: true
        });
        
      } catch (error) {
        console.log('❌ Token inválido encontrado:', doc.id, error.message);
        
        // Marcar token como inválido
        await doc.ref.update({
          isValid: false,
          invalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
          invalidationReason: 'validation_failed',
          lastError: error.message
        });
        
        validationResults.push({
          tokenId: doc.id,
          valid: false,
          tested: true,
          error: error.message
        });
      }
    }

    const validCount = validationResults.filter(r => r.valid).length;
    const invalidCount = validationResults.filter(r => !r.valid).length;

    console.log(`✅ Validação concluída: ${validCount} válidos, ${invalidCount} inválidos`);

    return {
      success: true,
      validTokens: validCount,
      invalidTokens: invalidCount,
      results: validationResults
    };

  } catch (error) {
    console.error('❌ Erro ao validar tokens:', error);
    throw new HttpsError('internal', 'Erro interno: ' + error.message);
  }
});

/**
 * Obter estatísticas de tokens para a loja
 */
exports.getStoreTokenStats = onCall(async (request) => {
  try {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    // Verificar se é usuário de loja
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'store') {
      throw new HttpsError('permission-denied', 'Acesso permitido apenas para lojas');
    }

    console.log('📊 Obtendo estatísticas de tokens para loja:', auth.uid);

    // Contar todos os tokens válidos
    const validTokensSnapshot = await db.collection('fcm_tokens')
      .where('isValid', '==', true)
      .get();

    // Contar inscrições na loja atual
    const storeSubscriptionsSnapshot = await db.collection('fcm_tokens')
      .where('isValid', '==', true)
      .where('storeSubscriptions', 'array-contains', auth.uid)
      .get();

    // Contar tokens por período (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTokensSnapshot = await db.collection('fcm_tokens')
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();

    const stats = {
      totalValidTokens: validTokensSnapshot.size,
      totalSubscribers: storeSubscriptionsSnapshot.size,
      recentTokens: recentTokensSnapshot.size,
      validTokens: validTokensSnapshot.size,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('📊 Estatísticas:', stats);

    return stats;

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    throw new HttpsError('internal', 'Erro interno: ' + error.message);
  }
});

/**
 * Função HTTP para limpar tokens antigos (manutenção)
 */
exports.cleanupOldTokens = onRequest(async (req, res) => {
  try {
    console.log('🧹 Iniciando limpeza de tokens antigos...');

    // Tokens mais antigos que 90 dias
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldTokensSnapshot = await db.collection('fcm_tokens')
      .where('lastUsed', '<', ninetyDaysAgo)
      .limit(100)
      .get();

    if (oldTokensSnapshot.empty) {
      console.log('✅ Nenhum token antigo encontrado');
      res.status(200).json({
        success: true,
        message: 'Nenhum token antigo para limpar',
        deletedCount: 0
      });
      return;
    }

    const batch = db.batch();
    oldTokensSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    const deletedCount = oldTokensSnapshot.docs.length;
    console.log(`✅ ${deletedCount} tokens antigos removidos`);

    res.status(200).json({
      success: true,
      message: `Limpeza concluída: ${deletedCount} tokens removidos`,
      deletedCount
    });

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
