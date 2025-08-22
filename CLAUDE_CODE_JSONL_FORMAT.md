# Documentation du Format JSONL de Claude Code

Ce document décrit le format de stockage interne utilisé par Claude Code pour sauvegarder les conversations dans des fichiers `.jsonl`.

## Structure Générale

- **Localisation** : `~/.claude/projects/*/[session-id].jsonl` (Linux/Mac) ou `%USERPROFILE%\.claude\projects\*\[session-id].jsonl` (Windows)
- **Format** : JSONL (JSON Lines) - chaque ligne est un objet JSON complet
- **Encodage** : UTF-8

## Champs Communs (présents dans tous les messages)

### Métadonnées de Session
- **`sessionId`** : Identifiant unique de la session de conversation
- **`uuid`** : Identifiant unique pour ce message spécifique
- **`parentUuid`** : UUID du message parent (null pour le premier message)
- **`timestamp`** : Horodatage ISO 8601 (ex: `"2025-07-14T14:23:02.503Z"`)
- **`cwd`** : Répertoire de travail courant au moment du message
- **`version`** : Version de Claude Code utilisée (ex: `"1.0.51"`)

### Classification du Message  
- **`type`** : Type de message (`"user"`, `"assistant"`, `"summary"`)
- **`userType`** : Type d'utilisateur (`"external"` pour les utilisateurs réguliers)
- **`isSidechain`** : Booléen, indique si c'est un message de chaîne latérale

### Métadonnées Optionnelles
- **`isMeta`** : Booléen, marque les messages de métadonnées système
- **`requestId`** : Identifiant de requête API (pour les messages assistant)

## Types de Messages

### 1. Messages Utilisateur (`type: "user"`)

#### Structure de Base
```json
{
  "parentUuid": "uuid-parent",
  "isSidechain": false,
  "userType": "external", 
  "cwd": "C:\\chemin\\vers\\projet",
  "sessionId": "session-uuid",
  "version": "1.0.51",
  "type": "user",
  "message": {
    "role": "user",
    "content": "Contenu du message ou array d'objets"
  },
  "uuid": "message-uuid",
  "timestamp": "2025-07-14T14:23:02.503Z"
}
```

#### Champs Spécifiques
- **`message.role`** : Toujours `"user"`
- **`message.content`** : 
  - Simple string pour du texte
  - Array d'objets pour du contenu complexe (tool results, etc.)

#### Messages de Commande
Pour les commandes Claude Code (`/ide`, etc.) :
```json
"message": {
  "role": "user",
  "content": "<command-name>/ide</command-name>\n<command-message>ide</command-message>\n<command-args></command-args>"
}
```

#### Tool Results
Quand l'utilisateur reçoit un résultat d'outil :
```json
"message": {
  "role": "user", 
  "content": [
    {
      "tool_use_id": "toolu_xxx",
      "type": "tool_result",
      "content": "Résultat de l'outil..."
    }
  ]
},
"toolUseResult": {
  "type": "text",
  "file": {
    "filePath": "chemin/vers/fichier",
    "content": "contenu du fichier",
    "numLines": 36,
    "startLine": 1, 
    "totalLines": 36
  }
}
```

### 2. Messages Assistant (`type: "assistant"`)

#### Structure de Base
```json
{
  "parentUuid": "uuid-parent",
  "isSidechain": false,
  "userType": "external",
  "cwd": "C:\\chemin\\vers\\projet", 
  "sessionId": "session-uuid",
  "version": "1.0.51",
  "message": {
    "id": "msg_xxx",
    "type": "message",
    "role": "assistant",
    "model": "claude-sonnet-4-20250514",
    "content": [...],
    "stop_reason": null,
    "stop_sequence": null,
    "usage": {...}
  },
  "requestId": "req_xxx",
  "type": "assistant",
  "uuid": "message-uuid",
  "timestamp": "2025-07-14T14:23:07.079Z"
}
```

#### Champs Spécifiques du Message
- **`message.id`** : ID du message Anthropic
- **`message.type`** : Toujours `"message"`
- **`message.role`** : Toujours `"assistant"`  
- **`message.model`** : Modèle utilisé (ex: `"claude-sonnet-4-20250514"`)
- **`message.stop_reason`** : Raison d'arrêt (null, `"tool_use"`, etc.)
- **`message.stop_sequence`** : Séquence d'arrêt (généralement null)

#### Contenu du Message (`message.content`)
Array d'objets pouvant contenir :

**Texte simple :**
```json
{
  "type": "text",
  "text": "Contenu du message texte"
}
```

**Utilisation d'outil :**
```json
{
  "type": "tool_use",
  "id": "toolu_xxx",
  "name": "Read", 
  "input": {
    "file_path": "chemin/vers/fichier"
  }
}
```

#### Statistiques d'Usage (`message.usage`)
```json
{
  "input_tokens": 5,
  "cache_creation_input_tokens": 262,
  "cache_read_input_tokens": 17299,
  "output_tokens": 24,
  "service_tier": "standard"
}
```

### 3. Messages de Résumé (`type: "summary"`)

Structure minimaliste pour les résumés de conversation :
```json
{
  "type": "summary",
  "summary": "Minecraft Mod: Twitch Chat Integration Prototype", 
  "leafUuid": "uuid-de-fin"
}
```

## Objets Complexes

### ToolUseResult
Présent dans les messages utilisateur lors de réponses d'outils :
```json
"toolUseResult": {
  "type": "text",
  "file": {
    "filePath": "chemin/absolu",
    "content": "contenu complet du fichier",
    "numLines": 36,
    "startLine": 1,
    "totalLines": 36
  }
}
```

Pour les todos :
```json
"toolUseResult": {
  "oldTodos": [...],
  "newTodos": [
    {
      "content": "Description de la tâche",
      "status": "completed|in_progress|pending",
      "priority": "high|medium|low",
      "id": "1"
    }
  ]
}
```

### Usage Statistics
Statistiques détaillées de consommation de tokens :
- **`input_tokens`** : Tokens d'entrée 
- **`output_tokens`** : Tokens de sortie
- **`cache_creation_input_tokens`** : Tokens pour création de cache
- **`cache_read_input_tokens`** : Tokens lus depuis le cache
- **`service_tier`** : Niveau de service (`"standard"`)

## Flux de Conversation

1. **Message initial** : `parentUuid: null`
2. **Messages suivants** : `parentUuid` pointe vers le message précédent
3. **Résumé** : Généré à la fin avec `leafUuid` pointant vers le dernier message

## Cas d'Usage Spéciaux

### Messages Meta (`isMeta: true`)
Messages système automatiques, comme les avertissements de commandes locales.

### Messages de Commandes Locales
Contiennent des balises spéciales :
- `<command-name>` : Nom de la commande
- `<command-message>` : Message de la commande  
- `<command-args>` : Arguments
- `<local-command-stdout>` : Sortie de la commande

### Rappels Système
Messages avec des `<system-reminder>` pour les alertes de sécurité et autres rappels.

## Notes Techniques

- Chaque ligne du fichier JSONL est un objet JSON valide et autonome
- L'ordre chronologique est maintenu par les timestamps
- La structure parent-enfant permet de reconstruire l'arbre de conversation
- Les UUIDs sont des identifiants uniques globaux
- Le cache de tokens optimise les performances pour les conversations longues

Ce format permet à Claude Code de maintenir un historique complet des conversations avec toutes les métadonnées nécessaires pour la reprise de session et l'analyse des interactions.