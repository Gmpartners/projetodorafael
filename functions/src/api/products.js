const { onRequest } = require("firebase-functions/v2/https");
const { authMiddleware } = require("../middleware/auth");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors")({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
});
const {COLLECTIONS} = require("../utils/config");
const { processCustomSteps, maskPhone, maskAddress, maskDocumentId } = require("../utils/timeConverter");

const app = express();

app.use(cors);
app.use(express.json());
app.use(authMiddleware);

// 🔧 FUNÇÃO PARA VALIDAR CUSTOM STEPS (MAIS FLEXÍVEL)
const validateCustomSteps = (customSteps) => {
  logger.info("🔍 Validando custom steps:", { 
    isArray: Array.isArray(customSteps), 
    length: customSteps?.length,
    steps: customSteps 
  });

  if (!Array.isArray(customSteps) || customSteps.length === 0) {
    logger.error("❌ Validação falhou: customSteps deve ser um array com pelo menos 1 etapa");
    return { valid: false, error: "customSteps deve ser um array com pelo menos 1 etapa" };
  }

  for (let i = 0; i < customSteps.length; i++) {
    const step = customSteps[i];
    
    logger.info(`🔍 Validando etapa ${i + 1}:`, step);
    
    if (!step.name || !step.name.trim()) {
      logger.error(`❌ Etapa ${i + 1}: nome é obrigatório`);
      return { valid: false, error: `Etapa ${i + 1}: nome é obrigatório` };
    }
    
    if (!step.scheduledFor || !step.scheduledFor.trim()) {
      logger.error(`❌ Etapa ${i + 1}: scheduledFor é obrigatório`);
      return { valid: false, error: `Etapa ${i + 1}: scheduledFor é obrigatório` };
    }
    
    // 🔧 VALIDAÇÃO MAIS FLEXÍVEL para durações relativas
    const scheduledFor = step.scheduledFor.trim();
    const timePattern = /^\d+\s*(minute|minutes|min|hour|hours|hr|day|days|d)s?$/i;
    
    if (!timePattern.test(scheduledFor)) {
      logger.error(`❌ Etapa ${i + 1}: formato inválido "${scheduledFor}"`);
      return { 
        valid: false, 
        error: `Etapa ${i + 1}: scheduledFor "${scheduledFor}" deve estar no formato "30 minutes", "2 hours", "1 day", etc.` 
      };
    }
    
    logger.info(`✅ Etapa ${i + 1} válida: "${step.name}" - "${scheduledFor}"`);
  }
  
  logger.info("✅ Todas as etapas são válidas");
  return { valid: true };
};

// 🆕 NOVO: Criar produto com estrutura para CartPanda
app.post("/createProduct", async (req, res) => {
  try {
    const storeId = req.user.uid;
    const productData = req.body;
    
    logger.info("📦 Recebendo dados para criar produto:", {
      storeId,
      hasDisplayName: !!productData?.displayName,
      hasImage: !!productData?.image,
      hasCustomSteps: !!productData?.customSteps,
      customStepsCount: productData?.customSteps?.length || 0,
      productData: productData
    });
    
    // ✅ NOVA VALIDAÇÃO: displayName, image, description, customSteps
    if (!productData || !productData.displayName || !productData.customSteps) {
      logger.error("❌ Dados incompletos:", {
        hasProductData: !!productData,
        hasDisplayName: !!productData?.displayName,
        hasImage: !!productData?.image,
        hasCustomSteps: !!productData?.customSteps
      });
      return res.status(400).send({
        error: "Dados incompletos. Necessário: displayName, customSteps (image é opcional)"
      });
    }

    // ✅ VALIDAR CUSTOM STEPS (SEM PROCESSAR)
    const validation = validateCustomSteps(productData.customSteps);
    if (!validation.valid) {
      logger.error("❌ Validação de custom steps falhou:", validation.error);
      return res.status(400).send({
        error: validation.error
      });
    }
    
    // 🔧 CORRIGIDO: NÃO processar custom steps - manter durações relativas
    const dataWithStore = {
      displayName: productData.displayName,
      image: productData.image || "", // Tornar imagem opcional
      description: productData.description || "",
      customSteps: productData.customSteps, // ✅ Manter durações relativas sem processar
      storeId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    };
    
    logger.info(`🆕 Criando produto para loja ${storeId}:`, {
      displayName: dataWithStore.displayName,
      customSteps: dataWithStore.customSteps.length,
      hasImage: !!dataWithStore.image,
      stepsFormats: dataWithStore.customSteps.map(s => s.scheduledFor)
    });
    
    const productRef = await admin.firestore()
      .collection(COLLECTIONS.PRODUCTS)
      .add(dataWithStore);
    
    const webhookId = productRef.id;
    const webhookUrl = `https://us-central1-projeto-rafael-53f73.cloudfunctions.net/webhookReceiver?productId=${webhookId}&storeId=${storeId}`;
    
    await productRef.update({
      webhookUrl,
      webhookId,
    });
    
    logger.info(`✅ Produto criado com sucesso: ${productRef.id}`);
    
    return res.status(201).send({
      success: true,
      message: "Produto criado com sucesso",
      productId: productRef.id,
      webhookUrl,
      customStepsCount: dataWithStore.customSteps.length,
    });
  } catch (error) {
    logger.error("❌ Erro ao criar produto", {error: error.message, stack: error.stack});
    return res.status(500).send({
      error: "Erro interno ao processar produto",
      details: error.message
    });
  }
});

app.get("/getStoreProducts", async (req, res) => {
  try {
    const storeId = req.user.uid;
    
    console.log("Buscando produtos para storeId:", storeId);
    
    // Query simplificada sem orderBy para evitar necessidade de índice composto
    const snapshot = await admin.firestore()
      .collection(COLLECTIONS.PRODUCTS)
      .where("storeId", "==", storeId)
      .where("active", "==", true)
      .get();
    
    console.log("Produtos encontrados:", snapshot.size);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Converter timestamps para strings se existirem
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });
    
    // Ordenar no código em vez de no Firestore
    products.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Mais recente primeiro
    });
    
    console.log("Produtos retornados:", products.length);
    
    return res.status(200).send({
      success: true,
      products,
      count: products.length,
      storeId: storeId
    });
  } catch (error) {
    logger.error("Erro ao buscar produtos da loja", {error: error.message, storeId: req.user?.uid});
    return res.status(500).send({
      error: "Erro interno ao buscar produtos",
      details: error.message
    });
  }
});

app.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const storeId = req.user.uid;
    const updateData = req.body;
    
    if (!productId) {
      return res.status(400).send({
        error: "ID do produto é obrigatório"
      });
    }
    
    const productRef = admin.firestore().collection(COLLECTIONS.PRODUCTS).doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send({
        error: "Produto não encontrado"
      });
    }
    
    if (productDoc.data().storeId !== storeId) {
      return res.status(403).send({
        error: "Produto não pertence à loja"
      });
    }
    
    // 🔧 CORRIGIDO: SE CUSTOM STEPS FORAM ATUALIZADOS, VALIDAR (MAS NÃO PROCESSAR)
    const processedUpdateData = { ...updateData };
    if (updateData.customSteps && Array.isArray(updateData.customSteps)) {
      const validation = validateCustomSteps(updateData.customSteps);
      if (!validation.valid) {
        return res.status(400).send({
          error: validation.error
        });
      }
      // ✅ Manter durações relativas sem processar
      processedUpdateData.customSteps = updateData.customSteps;
    }
    
    await productRef.update({
      ...processedUpdateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return res.status(200).send({
      success: true,
      message: "Produto atualizado com sucesso",
    });
  } catch (error) {
    logger.error("Erro ao atualizar produto", {error: error.message});
    return res.status(500).send({
      error: "Erro interno ao atualizar produto",
      details: error.message
    });
  }
});

app.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const storeId = req.user.uid;
    
    if (!productId) {
      return res.status(400).send({
        error: "ID do produto é obrigatório"
      });
    }
    
    const productRef = admin.firestore().collection(COLLECTIONS.PRODUCTS).doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send({
        error: "Produto não encontrado"
      });
    }
    
    if (productDoc.data().storeId !== storeId) {
      return res.status(403).send({
        error: "Produto não pertence à loja"
      });
    }
    
    await productRef.update({
      active: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return res.status(200).send({
      success: true,
      message: "Produto removido com sucesso",
    });
  } catch (error) {
    logger.error("Erro ao remover produto", {error: error.message});
    return res.status(500).send({
      error: "Erro interno ao remover produto",
      details: error.message
    });
  }
});

// 🆕 NOVO WEBHOOK RECEIVER - PARSER COMPLETO CARTPANDA
const webhookApp = express();
webhookApp.use(cors);
webhookApp.use(express.json());

webhookApp.post("/", async (req, res) => {
  try {
    const {productId, storeId} = req.query;
    const payload = req.body;
    
    logger.info("🔔 Webhook CartPanda recebido:", {
      productId,
      storeId,
      event: payload.event,
      hasOrder: !!payload.order
    });
    
    if (!productId || !storeId) {
      return res.status(400).send({
        error: "Parâmetros incompletos. Necessário productId e storeId."
      });
    }
    
    // ✅ VALIDAR ESTRUTURA DO CARTPANDA
    if (!payload || !payload.order || payload.event !== "order.paid") {
      return res.status(400).send({
        error: "Payload inválido. Esperado event: 'order.paid' e dados do pedido."
      });
    }
    
    const order = payload.order;
    
    // ✅ BUSCAR PRODUTO PARA HERDAR DADOS
    const productDoc = await admin.firestore()
      .collection(COLLECTIONS.PRODUCTS)
      .doc(productId)
      .get();
      
    if (!productDoc.exists || !productDoc.data().active) {
      return res.status(404).send({error: "Produto não encontrado ou inativo"});
    }
    
    if (productDoc.data().storeId !== storeId) {
      return res.status(403).send({error: "Produto não pertence à loja especificada"});
    }
    
    const productData = productDoc.data();
    
    // ✅ EXTRAIR DADOS DO CARTPANDA
    const lineItem = order.line_items && order.line_items[0];
    const customer = order.customer || {};
    const address = order.address || {};
    
    if (!lineItem) {
      return res.status(400).send({
        error: "Pedido sem itens (line_items vazio)"
      });
    }
    
    // ✅ PROCESSAR CUSTOM STEPS COM DATAS REAIS (baseado na data atual) - AQUI É CORRETO!
    const orderCreatedAt = new Date();
    logger.info("📅 Processando etapas do produto baseado em:", orderCreatedAt.toISOString());
    logger.info("🔧 Etapas do produto (durações relativas):", productData.customSteps.map(s => s.scheduledFor));
    
    const orderCustomSteps = processCustomSteps(productData.customSteps, orderCreatedAt);
    logger.info("✅ Etapas processadas (datas absolutas):", orderCustomSteps.map(s => s.scheduledFor));
    
    // ✅ ESTRUTURA COMPLETA DO PEDIDO
    const processedOrderData = {
      // IDs e referências
      externalOrderId: String(order.id),
      externalOrderNumber: order.number || order.order_number,
      productId,
      storeId,
      
      // Detalhes do produto (do cadastro + webhook)
      productDetails: {
        title: lineItem.title, // "Burn Jaro - 6 bottles" (do CartPanda)
        displayName: productData.displayName, // Nome configurado
        image: productData.image, // Imagem configurada
        description: productData.description, // Descrição configurada
        sku: lineItem.sku || null,
        quantity: lineItem.quantity || 1,
      },
      
      // Dados do cliente (MASCARADOS)
      customerEmail: order.email, // NÃO mascarado (usado para busca)
      customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      customer: {
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        email: order.email, // Usado para área do cliente
        phone: customer.phone ? maskPhone(customer.phone) : null,
        documentId: "***", // Sempre mascarado
      },
      
      // Endereço (MASCARADO)
      shippingAddress: {
        street: address.address1 ? maskAddress(address.address1) : null,
        complement: address.address2 ? "***" : null,
        neighborhood: address.neighborhood || null,
        city: address.city || null,
        state: address.province || address.state || null,
        zipCode: address.zip || null,
        country: address.country || "United States",
      },
      
      // Custom Steps (com datas calculadas)
      customSteps: orderCustomSteps,
      currentStepIndex: 0,
      
      // Status e metadados
      status: "new",
      progress: orderCustomSteps.length > 0 ? Math.round((1 / orderCustomSteps.length) * 100) : 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Dados de pagamento (MASCARADOS)
      payment: {
        method: order.payment_type || "Cartão de Crédito",
        status: "Aprovado",
        transactionId: "***", // Sempre mascarado
      },
    };
    
    logger.info("✅ Dados do pedido processados:", {
      externalOrderId: processedOrderData.externalOrderId,
      customerEmail: processedOrderData.customerEmail,
      productTitle: processedOrderData.productDetails.title,
      customStepsCount: orderCustomSteps.length,
      progress: processedOrderData.progress,
    });
    
    // ✅ CRIAR PEDIDO NO FIRESTORE
    const orderRef = await admin.firestore()
      .collection(COLLECTIONS.ORDERS)
      .add(processedOrderData);
    
    logger.info(`🎉 Pedido criado com sucesso: ${orderRef.id}`);
    
    return res.status(201).send({
      success: true,
      message: "Pedido criado com sucesso via CartPanda",
      orderId: orderRef.id,
      externalOrderId: processedOrderData.externalOrderId,
      customerEmail: processedOrderData.customerEmail,
      productTitle: processedOrderData.productDetails.title,
      customStepsScheduled: orderCustomSteps.length,
      progress: processedOrderData.progress,
    });
  } catch (error) {
    logger.error("❌ Erro ao processar webhook CartPanda", {error: error.message, stack: error.stack});
    return res.status(500).send({
      error: "Erro interno ao processar webhook",
      details: error.message
    });
  }
});

exports.productApi = onRequest(app);
exports.webhookReceiver = onRequest(webhookApp);