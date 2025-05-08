// backend/services/pdfService.js
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const fetch = require('node-fetch');
const s3Service = require('./s3Service');

// Function to extract text from PDF
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Function to summarize text using the BART model
const summarizeText = async (text) => {
  try {
    // Truncate text if too long (BART has token limits)
    const truncatedText = text.slice(0, 5000); // BART can handle ~1024 tokens
    
    // Call Hugging Face Inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: truncatedText,
          parameters: {
            max_length: 250,
            min_length: 100,
            do_sample: false,
          },
        }),
      }
    );
    
    const result = await response.json();
    
    // Check for errors
    if (result.error) {
      console.error('Hugging Face API error:', result.error);
      throw new Error(result.error);
    }
    
    // Extract summary
    const summaryText = result[0].summary_text;
    
    // Extract key points from the summary
    const keyPoints = extractKeyPoints(summaryText);
    
    // Extract topics from the original text
    const topics = extractTopics(truncatedText);
    
    return {
      mainPoints: keyPoints,
      summary: summaryText,
      topics: topics
    };
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw new Error('Failed to generate summary');
  }
};

// Extract key points from summary (simple approach - sentence splitting)
const extractKeyPoints = (summary) => {
  // Split by sentences
  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 20) // Filter out very short sentences
    .map(s => s.trim());
  
  // Take up to 5 sentences as key points
  return sentences.slice(0, 5);
};

// Extract topics using basic keyword frequency analysis
const extractTopics = (text) => {
  // Convert to lowercase and remove punctuation
  const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words
  const words = cleanedText.split(/\s+/);
  
  // Common stop words to filter out
  const stopWords = [
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'is', 'are', 'be', 'was', 'were', 'this', 'that', 'these', 'those', 
    'there', 'here', 'from', 'have', 'has', 'had', 'not', 'by', 'but', 
    'or', 'as', 'what', 'when', 'where', 'who', 'how', 'why', 'which',
    'their', 'they', 'them', 'then', 'than', 'can', 'could', 'would',
    'should', 'will', 'may', 'might', 'must', 'about'
  ];
  
  // Filter out stop words and short words
  const filteredWords = words.filter(word => 
    !stopWords.includes(word) && word.length > 3
  );
  
  // Count word frequencies
  const frequencies = {};
  filteredWords.forEach(word => {
    frequencies[word] = (frequencies[word] || 0) + 1;
  });
  
  // Sort by frequency and take top 5
  const topics = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return topics;
};

// Generate summary for a PDF file stored in S3
const generatePDFSummary = async (fileKey) => {
  try {
    // Download file from S3
    const s3Object = await s3Service.s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    }).promise();
    
    // Extract text from PDF
    const pdfText = await extractTextFromPDF(s3Object.Body);
    
    // Generate summary
    const summary = await summarizeText(pdfText);
    
    return summary;
  } catch (error) {
    console.error('Error generating PDF summary:', error);
    throw new Error('Failed to generate PDF summary');
  }
};

module.exports = {
  generatePDFSummary
};