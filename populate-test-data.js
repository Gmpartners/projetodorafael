// Script para popular dados de teste no backend
const axios = require('axios');

const API_BASE_URL = 'https://us-central1-projeto-rafael-53f73.cloudfunctions.net';
const API_KEY = 'dskOp23k49m3fk4';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Dados de teste
const testProducts = [
  {
    name: "Whey Protein Premium",
    description: "Proteína isolada de alta qualidade",
    price: 89.90,
    category: "Suplementos",
    imageUrl: "https://via.placeholder.com/300x300/4CAF50/white?text=Whey",
    customSteps: [
      { name: "Separando produtos", scheduledFor: "30 minutes", description: "Separando seu pedido no estoque" },
      { name: "Preparando envio", scheduledFor: "24 hours", description: "Embalando com cuidado" },
      { name: "Enviado aos Correios", scheduledFor: "48 hours", description: "Produto enviado para entrega" },
      { name: "Em trânsito", scheduledFor: "72 hours", description: "A caminho do seu endereço" },
      { name: "Saiu para entrega", scheduledFor