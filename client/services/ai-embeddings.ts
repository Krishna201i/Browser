/**
 * AI Embeddings Service for Kruger Browser
 * Provides vector search and semantic similarity capabilities
 */

export interface EmbeddingResult {
  id: string;
  text: string;
  embedding: number[];
  similarity?: number;
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  query: string;
  results: EmbeddingResult[];
  queryEmbedding: number[];
  processingTime: number;
}

export class AIEmbeddingsService {
  private embeddingsCache = new Map<string, number[]>();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private cacheTimestamps = new Map<string, number>();

  // Using a lightweight alternative since we don't have OpenAI
  // This simulates embeddings using text features
  private generateSimpleEmbedding(text: string): number[] {
    // Simple text-based embedding generation
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384-dimensional embedding

    // Generate features based on text characteristics
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = Math.abs(hash) % 384;
      embedding[position] += 1 / (index + 1); // Weight by position

      // Add character-based features
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        const charPos = (position + i) % 384;
        embedding[charPos] += charCode / 10000;
      }
    });

    // Normalize the embedding
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0),
    );
    return magnitude > 0 ? embedding.map((val) => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private isEmbeddingCacheValid(text: string): boolean {
    const timestamp = this.cacheTimestamps.get(text);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_EXPIRY;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const cacheKey = text.toLowerCase().trim();

    // Check cache first
    if (
      this.embeddingsCache.has(cacheKey) &&
      this.isEmbeddingCacheValid(cacheKey)
    ) {
      return this.embeddingsCache.get(cacheKey)!;
    }

    // Generate new embedding
    const embedding = this.generateSimpleEmbedding(text);

    // Cache the result
    this.embeddingsCache.set(cacheKey, embedding);
    this.cacheTimestamps.set(cacheKey, Date.now());

    return embedding;
  }

  async semanticSearch(
    query: string,
    documents: string[],
    topK: number = 10,
  ): Promise<VectorSearchResult> {
    const startTime = performance.now();

    // Get query embedding
    const queryEmbedding = await this.getEmbedding(query);

    // Get embeddings for all documents and calculate similarities
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < documents.length; i++) {
      const docEmbedding = await this.getEmbedding(documents[i]);
      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);

      results.push({
        id: `doc_${i}`,
        text: documents[i],
        embedding: docEmbedding,
        similarity,
        metadata: { index: i },
      });
    }

    // Sort by similarity (highest first) and take top K
    results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const topResults = results.slice(0, topK);

    const processingTime = performance.now() - startTime;

    return {
      query,
      results: topResults,
      queryEmbedding,
      processingTime,
    };
  }

  async findSimilarTexts(
    targetText: string,
    candidateTexts: string[],
    threshold: number = 0.7,
  ): Promise<EmbeddingResult[]> {
    const targetEmbedding = await this.getEmbedding(targetText);
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < candidateTexts.length; i++) {
      const candidateEmbedding = await this.getEmbedding(candidateTexts[i]);
      const similarity = this.cosineSimilarity(
        targetEmbedding,
        candidateEmbedding,
      );

      if (similarity >= threshold) {
        results.push({
          id: `candidate_${i}`,
          text: candidateTexts[i],
          embedding: candidateEmbedding,
          similarity,
          metadata: { index: i },
        });
      }
    }

    return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  }

  clearCache(): void {
    this.embeddingsCache.clear();
    this.cacheTimestamps.clear();
  }

  getCacheSize(): number {
    return this.embeddingsCache.size;
  }

  getCacheStats(): { size: number; memoryUsage: string } {
    const size = this.embeddingsCache.size;
    const memoryUsage = `${Math.round((size * 384 * 8) / 1024)} KB`; // Rough estimate
    return { size, memoryUsage };
  }
}

// Singleton instance
export const aiEmbeddingsService = new AIEmbeddingsService();
