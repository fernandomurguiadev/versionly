import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing/landing.page';
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';
import { VerifyPage } from './features/auth/verify/verify.page';
import { VerifySuccessPage } from './features/auth/verify-success/verify-success.page';
import { ForgotPasswordPage } from './features/auth/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './features/auth/reset-password/reset-password.page';
import { AuthErrorPage } from './features/auth/auth-error/auth-error.page';
import { OnboardingPage } from './features/onboarding/onboarding.page';
import { AppShellPage } from './pages/app-shell/app-shell.page';
import { WorkspacesPage } from './features/workspaces/workspaces.page';
import { WorkspaceDetailPage } from './features/workspaces/workspace-detail.page';
import { DocumentsPage } from './features/documents/documents.page';
import { DocumentDetailPage } from './features/documents/document-detail.page';
import { FoldersPage } from './features/folders/folders.page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'verify', component: VerifyPage },
  { path: 'verify/success', component: VerifySuccessPage },
  { path: 'reset', component: ForgotPasswordPage },
  { path: 'reset/token/:token', component: ResetPasswordPage },
  { path: 'auth/error', component: AuthErrorPage },
  { path: 'onboarding', component: OnboardingPage },
  {
    path: 'app',
    component: AppShellPage,
    children: [
      { path: '', redirectTo: 'workspaces', pathMatch: 'full' },
      { path: 'workspaces', component: WorkspacesPage },
      { path: 'workspaces/:wsId', component: WorkspaceDetailPage },
      { path: 'projects/:projectId/folders', component: FoldersPage },
      { path: 'folders/:folderId/documents', component: DocumentsPage },
      { path: 'documents/:docId', component: DocumentDetailPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
