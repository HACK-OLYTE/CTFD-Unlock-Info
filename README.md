# CTFD-Unlock-Info

**CTFD-Unlock-Info** est un plugin pour [CTFd](https://ctfd.io) permettant aux utilisateurs de visualiser les dépendances de déblocage des challenges directement sur l'interface.

---

## Fonctionnalités principales

- **Indicateur visuel des prérequis** :
  - Un petit icône "i" apparaît sur chaque challenge ayant des prérequis de déblocage.
  
- **Tooltip informatif** :
  - Au survol ou au clic de l'icône, un tooltip élégant affiche la liste des challenges qui ont dû être résolus pour débloquer le challenge actuel.

- **Support mode équipe et individuel** :
  - Fonctionne aussi bien en mode TEAM qu'en mode USER de CTFd.
  - Les dépendances affichées sont calculées en fonction des challenges réellement visibles par l'utilisateur/équipe.

- **Sécurité renforcée** :
  - Aucune fuite d'information : seuls les challenges déjà visibles par l'utilisateur sont mentionnés dans les tooltips.
  - Protection XSS native avec sanitization automatique des données.
  - Protection contre le spam serveur avec debouncing et rate limiting côté client.

## Pourquoi ce plugin ?

> "Quel challenge ai-je dû resoudre avant de pouvoir accéder à ce nouveau challenge ?

Avec ce plugin, chaque joueur peut instantanément visualiser les dépendances entre challenges, sans avoir à fouiller dans la description ou à deviner la progression logique.

Les participants gagnent en clarté sur le parcours à suivre, comprennent mieux la structure du CTF et peuvent planifier leur stratégie de résolution.

Côté organisation, le plugin aide à créer des parcours pédagogiques plus lisibles, où les joueurs comprennent naturellement la progression sans explications supplémentaires.

Grâce à ce plugin, tout le monde reste concentré sur la résolution des challenges, avec une vision claire de la roadmap.

## Installation

1. Clonez ce dépôt dans le dossier `CTFd/plugins` :
```bash
   cd /path/to/CTFd/plugins
   git clone https://github.com/HACK-OLYTE/CTFD-Unlock-Info.git
```

2. Redémarrez votre instance CTFd pour charger le plugin.

## Configuration

Aucune configuration n'est nécessaire ! Le plugin fonctionne automatiquement dès son installation.

Les indicateurs apparaîtront automatiquement sur tous les challenges ayant des prérequis définis dans CTFd.

**Note pour les admins** : Pour définir des prérequis sur un challenge, éditez le challenge dans l'admin et configurez les "Prerequisites" dans les paramètres avancés.

Voici un exemple de rendu du plugin :

<img width="793" height="264" alt="2025-12-19 16_56_55-OSINTOPIA — Mozilla Firefox" src="https://github.com/user-attachments/assets/2934c881-d49f-4322-8f6b-6e7ad668366d" />


## Fonctionnement technique

Le plugin :
1. Récupère la liste des challenges résolus par l'utilisateur/équipe
2. Calcule quels challenges sont actuellement visibles (débloqués)
3. Pour chaque challenge visible ayant des prérequis, affiche uniquement les prérequis qui sont eux-mêmes visibles
4. Injecte dynamiquement les icônes et tooltips sur les boutons de challenges

## Dépendances

- CTFd ≥ v3.8.1
- Compatible avec les installations Docker et locales
- Un navigateur à jour avec JavaScript activé
- CTFd thème : Core

## Sécurité

Ce plugin a été conçu avec la sécurité en priorité :
- ✅ Protection XSS avec utilisation exclusive de `.textContent`
- ✅ Sanitization automatique des données
- ✅ Pas de fuite d'information sur les challenges cachés
- ✅ Route admin protégée avec `@admins_only`
- ✅ Validation stricte des IDs de challenges
- ✅ Protection contre le spam serveur avec debouncing

## Support

Pour toute question ou problème, ouvrez une [issue](https://github.com/HACK-OLYTE/CTFD-Unlock-Info/issues).  
Ou contactez-nous sur le site de l'association Hack'olyte : [contact](https://hackolyte.fr/contact/).

## Contribuer

Les contributions sont les bienvenues !  
Vous pouvez :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Soumettre des pull requests
- Améliorer la documentation

## Crédits

Développé avec ❤️ par l'association [Hack'olyte](https://hackolyte.fr)

## Licence

Ce plugin est sous licence [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.fr).  
Merci de ne pas retirer le footer de chaque fichier HTML sans l'autorisation préalable de l'association Hack'olyte.
