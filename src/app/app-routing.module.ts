import { TransportComponent } from './components/pages/transport/transport.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';

const routes: Routes = [
  { path: "", redirectTo: 'minico', pathMatch:'full' },
  { path: "minico", component: HomeComponent },
  { path: "balas", component: TransportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
