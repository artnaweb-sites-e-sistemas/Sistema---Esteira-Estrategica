# 🔥 Configuração do Firebase

## 📋 Pré-requisitos
- Conta no Google/Firebase
- Projeto criado no Firebase Console

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto
4. Configure Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Authentication
1. No painel lateral, clique em "Authentication"
2. Vá para a aba "Sign-in method"
3. Ative "Email/password"
4. Salve as configurações

### 3. Configurar Firestore Database
1. No painel lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione a localização (preferencialmente próxima ao Brasil)
5. Clique em "Concluído"

### 4. Obter Credenciais
1. Clique no ícone de engrenagem ⚙️ > "Configurações do projeto"
2. Na aba "Geral", role até "Seus aplicativos"
3. Clique no ícone da web `</>`
4. Digite um nome para o app
5. **NÃO** marque "Firebase Hosting"
6. Clique em "Registrar app"
7. Copie as credenciais mostradas

### 5. Configurar no Projeto
1. Crie um arquivo `.env` na raiz do projeto
2. Copie o conteúdo de `.env.example`
3. Substitua os valores pelas suas credenciais:

```env
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=seu-app-id
```

### 6. Atualizar Configuração
Edite o arquivo `src/config/firebase.ts` para usar as variáveis de ambiente:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 7. Configurar Regras de Segurança (Firestore)
No Firebase Console > Firestore Database > Regras, substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas a dados do próprio usuário
    match /funnels/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 8. Testar a Conexão
1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Tente criar uma conta na tela de login
3. Verifique se os dados aparecem no Firestore Console

## 🔒 Segurança
- **NUNCA** commite o arquivo `.env` no Git
- Use regras de segurança adequadas no Firestore
- Em produção, configure domínios autorizados

## 🆘 Problemas Comuns
- **Erro de CORS**: Verifique se o domínio está autorizado no Firebase
- **Erro de permissão**: Verifique as regras do Firestore
- **Credenciais inválidas**: Confirme se copiou corretamente do Firebase Console

## 📚 Recursos Úteis
- [Documentação Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)