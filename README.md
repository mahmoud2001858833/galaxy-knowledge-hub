# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b14850b9-b866-4d7a-90cb-94a0092a7d9d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b14850b9-b866-4d7a-90cb-94a0092a7d9d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b14850b9-b866-4d7a-90cb-94a0092a7d9d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## 📱 Building Android App

This project is configured to be built as an Android app using Capacitor.

### Prerequisites:
- Android Studio installed
- JDK 17 or newer
- Node.js and npm

### Steps to Build:
1. **Export to GitHub**: Use the "Export to Github" button in Lovable
2. **Clone the project**: `git clone <your-repo-url>`
3. **Navigate to directory**: `cd <project-name>`
4. **Install dependencies**: `npm install`
5. **Add Android platform**: `npx cap add android`
6. **Update platform**: `npx cap update android`
7. **Build the project**: `npm run build`
8. **Sync files**: `npx cap sync`
9. **Open in Android Studio**: `npx cap open android`

### Important Notes:
- **Hot Reload**: Currently enabled - the app displays content from the live website
- **For Production**: Disable Hot Reload in `capacitor.config.ts` before publishing to Google Play Store
- **Icons**: Default icons are included in `public/icons/` - customize them as needed
- **Testing**: Use Android Studio to run on emulator or physical device

### Useful Commands:
```bash
npm run build    # Build the web app
npx cap sync     # Sync web build to native project
npx cap open android  # Open project in Android Studio
```

Read more: [Capacitor Documentation](https://capacitorjs.com/docs)
