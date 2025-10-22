import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Login } from './login/login';
import { IndividualRegistrationComponent } from './registration/individual-registration/individual-registration';
import { CompanyRegistrationComponent } from './registration/company-registration/company-registration';
import { AssociationRegistration } from './registration/association-registration/association-registration';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'homepage', component: Homepage },
  { path: 'connexion', component: Login },
  { path: 'inscription/individu', component: IndividualRegistrationComponent },
  { path: 'inscription/entreprise', component: CompanyRegistrationComponent },
  { path: 'inscription/association', component: AssociationRegistration }
];
