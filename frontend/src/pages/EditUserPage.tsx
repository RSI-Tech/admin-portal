import { useParams } from 'react-router-dom';
import UserForm from '../components/UserForm';

export default function EditUserPage() {
  const { id } = useParams();
  const userKey = id ? parseInt(id, 10) : undefined;
  
  if (!userKey || isNaN(userKey)) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">Invalid user ID provided</div>
        </div>
      </div>
    );
  }
  
  return <UserForm mode="edit" userKey={userKey} />;
}