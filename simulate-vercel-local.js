#!/usr/bin/env node

/**
 * Script de simulation du déploiement Vercel en local
 * Simule l'environnement de production Vercel
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Simulation du déploiement Vercel en local...\n');

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = 'production';

// Étape 1: Vérifier les dépendances
console.log('📦 Vérification des dépendances...');
exec('npm list --depth=0', (error, stdout) => {
  if (error) {
    console.log('⚠️  Certaines dépendances peuvent manquer, installation...');
    exec('npm install', (installError) => {
      if (installError) {
        console.error('❌ Erreur lors de l\'installation:', installError);
        process.exit(1);
      }
      buildAndServe();
    });
  } else {
    buildAndServe();
  }
});

function buildAndServe() {
  // Étape 2: Build de production
  console.log('\n🔨 Construction de l\'application en mode production...');
  console.log('  Cela peut prendre quelques minutes...\n');

  const buildProcess = spawn('npm', ['run', 'build'], {
    env: { ...process.env, NODE_ENV },
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Erreur lors du build');
      process.exit(1);
    }

    console.log('\n✅ Build terminé avec succès!');
    
    // Afficher les informations de build
    const nextPath = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextPath)) {
      const stats = fs.statSync(nextPath);
      console.log(`📊 Taille du build: ${(getDirSize(nextPath) / 1024 / 1024).toFixed(2)} MB`);
    }

    // Étape 3: Lancer le serveur de production
    console.log('\n🌐 Lancement du serveur de production...');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('   Appuyez sur Ctrl+C pour arrêter le serveur\n');

    const serverProcess = spawn('npm', ['start'], {
      env: { ...process.env, NODE_ENV, PORT },
      stdio: 'inherit',
      shell: true
    });

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Arrêt du serveur...');
      serverProcess.kill();
      process.exit(0);
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Erreur du serveur:', error);
      process.exit(1);
    });
  });
}

// Fonction utilitaire pour calculer la taille d'un dossier
function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

console.log('🔍 Variables d\'environnement:');
console.log(`   NODE_ENV: ${NODE_ENV}`);
console.log(`   PORT: ${PORT}`);
console.log('');