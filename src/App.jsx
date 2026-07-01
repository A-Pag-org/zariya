import { useState } from "react";
import { AuthPages } from "./features/auth/AuthPages";
import { DonorMappingModule } from "./features/donor-mapping/DonorMappingModule";

function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <AuthPages onAuthenticated={(user) => setSession({ user })} />;
  }

  return <DonorMappingModule user={session.user} onSignOut={() => setSession(null)} />;
}

export default App;
