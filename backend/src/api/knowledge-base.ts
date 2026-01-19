import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all knowledge bases for authenticated user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const agentId = req.query.agentId as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (agentId) {
      where.agentId = agentId;
    }

    // Get knowledge bases through agents
    const agentWhere: any = {
      userId: req.user!.id,
    };

    if (agentId) {
      agentWhere.id = agentId;
    }

    const [knowledgeBases, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where: {
          agent: agentWhere,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      }),
      prisma.knowledgeBase.count({
        where: {
          agent: agentWhere,
        },
      }),
    ]);

    res.json({
      data: knowledgeBases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get documents in a knowledge base
router.get('/:kbId/documents', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const kbId = Array.isArray(req.params.kbId) ? req.params.kbId[0] : req.params.kbId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Verify knowledge base belongs to user's agent
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: kbId,
        agent: {
          userId: req.user!.id,
        },
      },
    });

    if (!knowledgeBase) {
      throw new AppError('Knowledge base not found', 404, 'KB_NOT_FOUND');
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: { knowledgeBaseId: kbId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where: { knowledgeBaseId: kbId } }),
    ]);

    res.json({
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Upload a document to knowledge base
router.post('/:kbId/documents', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const kbId = Array.isArray(req.params.kbId) ? req.params.kbId[0] : req.params.kbId;
    const { title, content } = req.body;

    if (!title || !content) {
      throw new AppError('Title and content are required', 400, 'MISSING_FIELDS');
    }

    // Verify knowledge base belongs to user's agent
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: kbId,
        agent: {
          userId: req.user!.id,
        },
      },
    });

    if (!knowledgeBase) {
      throw new AppError('Knowledge base not found', 404, 'KB_NOT_FOUND');
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        knowledgeBaseId: kbId,
        fileName: title,
        fileSize: content?.length || 0,
        fileType: 'text',
      },
    });

    // TODO: Implement document processing and vectorization
    // This would involve:
    // 1. Extract text from document (PDF, DOCX, etc.)
    // 2. Chunk the text into smaller pieces
    // 3. Generate embeddings using OpenAI or similar
    // 4. Store embeddings in vector database (Pinecone)
    // 5. Create DocumentChunk records

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

// Get document chunks for RAG
router.get('/:kbId/documents/:documentId/chunks', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const kbId = Array.isArray(req.params.kbId) ? req.params.kbId[0] : req.params.kbId;

    // Verify knowledge base belongs to user's agent
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: kbId,
        agent: {
          userId: req.user!.id,
        },
      },
    });

    if (!knowledgeBase) {
      throw new AppError('Knowledge base not found', 404, 'KB_NOT_FOUND');
    }

    // TODO: Implement chunk retrieval when DocumentChunk model is added to schema
    res.json({
      data: [],
      message: 'Document chunks not yet implemented'
    });
  } catch (error) {
    next(error);
  }
});

// Delete a document
router.delete('/:kbId/documents/:documentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const kbId = Array.isArray(req.params.kbId) ? req.params.kbId[0] : req.params.kbId;
    const documentId = Array.isArray(req.params.documentId) ? req.params.documentId[0] : req.params.documentId;

    // Verify knowledge base belongs to user's agent
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: kbId,
        agent: {
          userId: req.user!.id,
        },
      },
    });

    if (!knowledgeBase) {
      throw new AppError('Knowledge base not found', 404, 'KB_NOT_FOUND');
    }

    // Delete document (cascade will delete chunks)
    await prisma.document.delete({
      where: { id: documentId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Search knowledge base (semantic search)
router.post('/:kbId/search', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const kbId = Array.isArray(req.params.kbId) ? req.params.kbId[0] : req.params.kbId;
    const { query } = req.body;

    if (!query) {
      throw new AppError('Query is required', 400, 'MISSING_QUERY');
    }

    // Verify knowledge base belongs to user's agent
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: kbId,
        agent: {
          userId: req.user!.id,
        },
      },
    });

    if (!knowledgeBase) {
      throw new AppError('Knowledge base not found', 404, 'KB_NOT_FOUND');
    }

    // TODO: Implement semantic search using vector embeddings
    // This would involve:
    // 1. Generate embedding for the query
    // 2. Search vector database (Pinecone) for similar chunks
    // 3. Return relevant chunks with scores

    // For now, return empty results
    res.json({
      data: [],
      message: 'Semantic search not yet implemented',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
