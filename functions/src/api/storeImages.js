const { onRequest } = require("firebase-functions/v2/https");
const { authMiddleware } = require("../middleware/auth");
const logger = require("firebase-functions/logger");
const express = require("express");
const multer = require("multer");
const cors = require("cors")({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
});

// Criar app Express
const app = express();

// CORS primeiro
app.use(cors);

// 🔧 CORRIGIDO: Configurar multer com configurações mais específicas
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
    fieldSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

/**
 * 🔥 UPLOAD DE LOGO - MIDDLEWARE CORRIGIDO
 * IMPORTANTE: Multer DEVE vir ANTES do authMiddleware para processar o FormData
 */
app.post("/uploadLogo", upload.single('logo'), authMiddleware, async (req, res) => {
  try {
    logger.info(`🚀 Upload de logo iniciado`, {
      hasFile: !!req.file,
      storeId: req.user?.uid,
      contentType: req.headers['content-type']
    });

    if (!req.file) {
      logger.error(`❌ Nenhum arquivo recebido`);
      
      return res.status(400).json({
        success: false,
        error: "Nenhum arquivo enviado. Envie o arquivo no campo 'logo'"
      });
    }

    const storeId = req.user.uid;
    logger.info(`📤 Processando upload:`, {
      storeId,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload DIRETO para Firebase Storage
    const admin = require("firebase-admin");
    const bucket = admin.storage().bucket();
    
    // Nome único do arquivo
    const timestamp = Date.now();
    const extension = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
    const fileName = `logo_${timestamp}.${extension}`;
    const filePath = `stores/${storeId}/${fileName}`;
    
    logger.info(`💾 Salvando no Storage: ${filePath}`);
    
    // Upload para Storage
    const file = bucket.file(filePath);
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          storeId: storeId,
          type: 'logo',
          originalName: req.file.originalname
        }
      },
      public: true
    });
    
    // URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    logger.info(`🌐 URL gerada: ${publicUrl}`);
    
    // Salvar no Firestore
    const db = admin.firestore();
    const imageDoc = await db.collection("storeImages").add({
      storeId,
      type: 'logo',
      url: publicUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      contentType: req.file.mimetype,
      filePath,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Atualizar loja - usando set com merge para evitar sobrescrever
    await db.collection("stores").doc(storeId).set({
      branding: {
        logoUrl: publicUrl
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    logger.info(`✅ Logo salvo com sucesso: ${imageDoc.id}`);
    
    return res.status(200).json({
      success: true,
      message: "Logo uploadado com sucesso!",
      data: {
        imageUrl: publicUrl,
        imageId: imageDoc.id,
        type: 'logo',
        size: req.file.size
      }
    });
    
  } catch (error) {
    logger.error("❌ Erro no upload de logo:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno no servidor",
      details: error.message
    });
  }
});

/**
 * 🔥 UPLOAD DE BANNER - MIDDLEWARE CORRIGIDO
 */
app.post("/uploadBanner", upload.single('banner'), authMiddleware, async (req, res) => {
  try {
    logger.info(`🚀 Upload de banner iniciado`, {
      hasFile: !!req.file,
      storeId: req.user?.uid
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhum arquivo enviado. Envie o arquivo no campo 'banner'"
      });
    }

    const storeId = req.user.uid;

    // Upload para Firebase Storage
    const admin = require("firebase-admin");
    const bucket = admin.storage().bucket();
    
    const timestamp = Date.now();
    const extension = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
    const fileName = `banner_${timestamp}.${extension}`;
    const filePath = `stores/${storeId}/${fileName}`;
    
    const file = bucket.file(filePath);
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          storeId: storeId,
          type: 'banner'
        }
      },
      public: true
    });
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    // Salvar no Firestore
    const db = admin.firestore();
    const imageDoc = await db.collection("storeImages").add({
      storeId,
      type: 'banner',
      url: publicUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection("stores").doc(storeId).set({
      branding: {
        bannerUrl: publicUrl
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    logger.info(`✅ Banner salvo com sucesso: ${imageDoc.id}`);
    
    return res.status(200).json({
      success: true,
      message: "Banner uploadado com sucesso!",
      data: {
        imageUrl: publicUrl,
        imageId: imageDoc.id,
        type: 'banner',
        size: req.file.size
      }
    });
    
  } catch (error) {
    logger.error("❌ Erro no upload de banner:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno no servidor",
      details: error.message
    });
  }
});

/**
 * 🔥 UPLOAD DE FAVICON - NOVO ENDPOINT
 */
app.post("/uploadFavicon", upload.single('favicon'), authMiddleware, async (req, res) => {
  try {
    logger.info(`🚀 Upload de favicon iniciado`, {
      hasFile: !!req.file,
      storeId: req.user?.uid
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhum arquivo enviado. Envie o arquivo no campo 'favicon'"
      });
    }

    const storeId = req.user.uid;

    // Upload para Firebase Storage
    const admin = require("firebase-admin");
    const bucket = admin.storage().bucket();
    
    const timestamp = Date.now();
    const extension = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
    const fileName = `favicon_${timestamp}.${extension}`;
    const filePath = `stores/${storeId}/${fileName}`;
    
    const file = bucket.file(filePath);
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          storeId: storeId,
          type: 'favicon'
        }
      },
      public: true
    });
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    // Salvar no Firestore
    const db = admin.firestore();
    const imageDoc = await db.collection("storeImages").add({
      storeId,
      type: 'favicon',
      url: publicUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection("stores").doc(storeId).set({
      branding: {
        faviconUrl: publicUrl
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    logger.info(`✅ Favicon salvo com sucesso: ${imageDoc.id}`);
    
    return res.status(200).json({
      success: true,
      message: "Favicon uploadado com sucesso!",
      data: {
        imageUrl: publicUrl,
        imageId: imageDoc.id,
        type: 'favicon',
        size: req.file.size
      }
    });
    
  } catch (error) {
    logger.error("❌ Erro no upload de favicon:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno no servidor",
      details: error.message
    });
  }
});

// Middleware JSON para outras rotas (DEPOIS do upload)
app.use(express.json());

/**
 * 🔍 BUSCAR IMAGENS DA LOJA
 */
app.get("/getStoreImages", authMiddleware, async (req, res) => {
  try {
    const storeId = req.user.uid;
    const admin = require("firebase-admin");
    const db = admin.firestore();
    
    const imagesSnapshot = await db.collection("storeImages")
      .where("storeId", "==", storeId)
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    
    const images = {};
    imagesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      images[data.type] = {
        url: data.url,
        size: data.size,
        createdAt: data.createdAt
      };
    });
    
    return res.status(200).json({
      success: true,
      data: {
        images,
        stats: {
          hasLogo: !!images.logo,
          hasBanner: !!images.banner,
          hasFavicon: !!images.favicon,
          totalImages: Object.keys(images).length
        }
      }
    });
  } catch (error) {
    logger.error("❌ Erro ao buscar imagens:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno ao buscar imagens",
      details: error.message
    });
  }
});

/**
 * 🎨 BUSCAR CONFIGURAÇÕES DE BRANDING
 */
app.get("/getBrandingSettings", authMiddleware, async (req, res) => {
  try {
    const storeId = req.user.uid;
    const admin = require("firebase-admin");
    const db = admin.firestore();
    
    // Buscar configurações da loja
    const storeDoc = await db.collection("stores").doc(storeId).get();
    const storeData = storeDoc.exists ? storeDoc.data() : {};
    
    // Buscar imagens
    const imagesSnapshot = await db.collection("storeImages")
      .where("storeId", "==", storeId)
      .where("isActive", "==", true)
      .get();
    
    const images = {};
    imagesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      images[data.type + 'Url'] = data.url;
    });
    
    const branding = {
      // URLs das imagens
      logoUrl: images.logoUrl || null,
      bannerUrl: images.bannerUrl || null,
      faviconUrl: images.faviconUrl || null,
      
      // Cores (com padrões)
      primaryColor: storeData.branding?.primaryColor || '#2196F3',
      secondaryColor: storeData.branding?.secondaryColor || '#FF5722',
      textColor: storeData.branding?.textColor || '#212121',
      backgroundColor: storeData.branding?.backgroundColor || '#FFFFFF'
    };
    
    return res.status(200).json({
      success: true,
      data: branding
    });
  } catch (error) {
    logger.error("❌ Erro ao buscar branding:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno"
    });
  }
});

/**
 * 🎨 ATUALIZAR CORES DE BRANDING
 */
app.put("/updateBrandingColors", authMiddleware, async (req, res) => {
  try {
    const storeId = req.user.uid;
    const { primaryColor, secondaryColor, textColor, backgroundColor } = req.body;
    
    const admin = require("firebase-admin");
    const db = admin.firestore();
    
    await db.collection("stores").doc(storeId).set({
      branding: {
        primaryColor: primaryColor || '#2196F3',
        secondaryColor: secondaryColor || '#FF5722',
        textColor: textColor || '#212121',
        backgroundColor: backgroundColor || '#FFFFFF'
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return res.status(200).json({
      success: true,
      message: "Cores atualizadas com sucesso!"
    });
  } catch (error) {
    logger.error("❌ Erro ao atualizar cores:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno"
    });
  }
});

/**
 * 🗑️ REMOVER IMAGEM
 */
app.delete("/removeImage/:type", authMiddleware, async (req, res) => {
  try {
    const storeId = req.user.uid;
    const imageType = req.params.type;
    const admin = require("firebase-admin");
    const db = admin.firestore();
    
    const imageQuery = await db.collection("storeImages")
      .where("storeId", "==", storeId)
      .where("type", "==", imageType)
      .where("isActive", "==", true)
      .get();
    
    if (imageQuery.empty) {
      return res.status(404).json({
        success: false,
        error: "Imagem não encontrada"
      });
    }
    
    // Desativar imagem
    const batch = db.batch();
    imageQuery.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    await batch.commit();
    
    // Remover do branding da loja
    const brandingUpdate = {};
    brandingUpdate[`branding.${imageType}Url`] = null;
    await db.collection("stores").doc(storeId).update(brandingUpdate);
    
    return res.status(200).json({
      success: true,
      message: `${imageType} removido com sucesso`
    });
  } catch (error) {
    logger.error("❌ Erro ao remover imagem:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno"
    });
  }
});

// Exportar
exports.storeImagesApi = onRequest(app);