import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { OrganizationLayout, ProtectedRoute } from './components/Layout';
import AuthPage from './pages/Auth';
import Workspaces from './pages/Workspaces';
import Dashboard from './pages/Dashboard';
import Projects, { ProjectDetail } from './pages/Projects';
import Tasks from './pages/Tasks';
import Members from './pages/Members';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Invitation from './pages/Invitation';
import TaskDetail from './pages/TaskDetail';
import Notifications from './pages/Notifications';
import Approvals from './pages/Approvals';
function OrgRoute() {return <OrganizationProvider><OrganizationLayout/></OrganizationProvider>;}
export default function App() {return <BrowserRouter><AuthProvider><Routes>
  <Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage mode="register"/>}/>
  <Route element={<ProtectedRoute/>}>
    <Route path="/organizations" element={<Workspaces/>}/>
    <Route path="/invite/:token" element={<Invitation/>}/>
    <Route path="/org/:slug" element={<OrgRoute/>}>
      <Route index element={<Navigate to="dashboard" replace/>}/>
      <Route path="dashboard" element={<Dashboard/>}/>
      <Route path="projects" element={<Projects/>}/><Route path="projects/:id" element={<ProjectDetail/>}/>
      <Route path="tasks" element={<Tasks/>}/><Route path="tasks/:id" element={<TaskDetail/>}/>
      <Route path="approvals" element={<Approvals/>}/><Route path="notifications" element={<Notifications/>}/><Route path="members" element={<Members/>}/>
      <Route path="activity" element={<Activity/>}/><Route path="settings" element={<Settings/>}/>
    </Route>
  </Route>
  <Route path="*" element={<Navigate to="/organizations" replace/>}/>
</Routes></AuthProvider></BrowserRouter>;}
