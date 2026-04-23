# Refactorisation SOLID de BetterTicket

## 1. Objectif
Refactoriser le code de gestion des interactions (boutons, modaux, commandes) pour respecter les principes SOLID, améliorer la lisibilité en évitant les structures conditionnelles imbriquées (if/else), appliquer le principe KISS et réduire la duplication de code (DRY).

## 2. Architecture Proposée

L'architecture s'appuie sur une séparation stricte des responsabilités.

```text
src/
├── core/
│   ├── InteractionManager.ts  # Chargeur automatique et routeur
│   ├── BaseHandler.ts         # Interfaces pour les classes d'interaction
├── services/
│   ├── TicketService.ts       # Logique métier (Base de données + Actions Discord)
├── interactions/
│   ├── buttons/               # Un fichier = une classe de bouton
│   ├── modals/                # Un fichier = une classe de modal
├── commands/                  # Commandes slash existantes (allégées)
├── index.ts                   # Point d'entrée épuré
```

## 3. Composants Clés

### 3.1 `core/BaseHandler.ts`
Définit le contrat que chaque gestionnaire d'interaction doit respecter.
*   `ButtonHandler` : Interface nécessitant un `customId` et une méthode `execute(interaction: ButtonInteraction)`.
*   `ModalHandler` : Interface nécessitant un `customId` et une méthode `execute(interaction: ModalSubmitInteraction)`.
*   `CommandHandler` : (Optionnel, si on standardise aussi les commandes).

### 3.2 `core/InteractionManager.ts`
C'est le système central de dispatch.
*   **Initialisation** : Parcourt dynamiquement les dossiers `interactions/buttons` et `interactions/modals`.
*   **Stockage** : Instancie chaque classe trouvée et les stocke dans des dictionnaires (`Map`).
*   **Routage** : Dans l'événement `InteractionCreate`, récupère l'instance correspondante via `map.get(customId)` et appelle sa méthode `execute`.
*   **KISS** : Élimine totalement le besoin d'une cascade de `if/else` ou d'un `switch` géant.

### 3.3 `services/TicketService.ts`
Centralise toute la logique métier. Si le schéma de BDD ou la façon dont on gère les channels Discord change, c'est ici que ça se passe.
*   Méthodes prévues :
    *   `createTicketChannel(user, subject, description, guild)`
    *   `closeTicket(channelId, user)`
    *   `reopenTicket(channelId, user)`
    *   `archiveTicket(channelId)`
    *   `getTicketByChannel(channelId)`

### 3.4 `interactions/...`
Chaque bouton ou modal de l'ancien `index.ts` est extrait dans sa propre classe.
*   Exemple : `interactions/buttons/OpenTicketButton.ts`
*   Ces classes agissent comme des contrôleurs : elles reçoivent la requête, appellent le `TicketService`, et retournent la réponse visuelle (message, modal) à l'utilisateur.

## 4. Principes Appliqués
*   **Single Responsibility Principle (SRP)** : Séparation claire entre Routage, Interface Utilisateur (Handlers), et Logique Métier (Services).
*   **Open/Closed Principle (OCP)** : Pour ajouter un nouveau bouton, il suffit de créer un nouveau fichier dans le dossier `buttons`. Aucune modification du routeur central n'est requise.
*   **DRY (Don't Repeat Yourself)** : Mutualisation des accès BDD et des vérifications dans le Service.
*   **Lisibilité / "Guard Clauses"** : Utilisation de retours anticipés (`if (!ticket) return;`) pour éviter les indentations profondes.
