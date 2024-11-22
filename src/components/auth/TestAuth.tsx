import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function TestAuth() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const testQuery = useQuery(api.clients.getClients);
  const createClient = useMutation(api.clients.createClient);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleCreateTestClient = async () => {
    try {
      const result = await createClient({
        company: "Test Company",
        name: "Test User",
        email: "test@example.com",
        phone: "555-0123",
        address: "123 Test St"
      });
      console.log("Created test client:", result);
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Auth Status:</h3>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>

        {isAuthenticated && user && (
          <div>
            <h3 className="font-semibold">User Info:</h3>
            <p>Email: {user.email}</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold">Convex Test Query:</h3>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(testQuery, null, 2)}
          </pre>
          <button
            onClick={handleCreateTestClient}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Test Client
          </button>
        </div>
      </div>
    </div>
  );
}
