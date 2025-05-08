// backend/services/pdfService.js
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const fetch = require('node-fetch');
const s3Service = require('./s3Service');
const OpenAI = require('openai'); 

// Function to extract text from PDF (unchanged)
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Updated function to summarize text using OpenAI
const summarizeText = async (text) => {
  try {
    // OpenAI has larger context windows than BART, but still has limits
    // GPT-4o can handle around 128,000 tokens
    // For longer documents, you might need to chunk the text
    const truncatedText = text.slice(0, 25000); // Increased from 5000 for BART
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Make sure to set this environment variable
    });
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model, you can change to gpt-4-turbo or others
      messages: [
        {
          role: "system",
          content: "You are a highly skilled assistant specialized in summarizing PDF documents. Create concise, informative summaries that highlight the main points."
        },
        {
          role: "user",
          content: `Please summarize the following text and extract the key points and main topics:
          
        ${truncatedText}

        Return your response in JSON format with the following structure:
        {
          "summary": "A comprehensive summary of the document",
          "mainPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
          "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
        }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more focused/deterministic outputs
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Return in the same format your existing code expects
    return {
      mainPoints: result.mainPoints,
      summary: result.summary,
      topics: result.topics
    };
  } catch (error) {
    console.error('Error summarizing text with OpenAI:', error);
    throw new Error('Failed to generate summary');
  }
};

// The extractKeyPoints and extractTopics functions are no longer needed
// as OpenAI will handle this directly, but you can keep them as fallbacks

// Generate summary for a PDF file stored in S3 (minimal changes)
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