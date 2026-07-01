import { AuthPrintPage } from "./features/auth-print/AuthPrintPage";
import { authPrintMockData } from "./features/auth-print/authPrintMockData";

function App() {
  return <AuthPrintPage documentData={authPrintMockData} />;
}

export default App;
