#!/bin/bash
cd /workspaces/Ta-madz-Pix

# Nettoyer les anciens processus
pkill -f "expo" 2>/dev/null || true
pkill -f "node.*metro" 2>/dev/null || true
sleep 2

echo "🚀 Démarrage du serveur Expo..."
echo "⏳ Attendez 15-20 secondes pour le QR code...\n"

npx expo start
