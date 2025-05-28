import { useParams } from 'react-router-dom';

export default function DuplicateUserPage() {
  const { id } = useParams();
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Duplicate User</h1>
      <p className="mt-2 text-sm text-gray-700">
        Duplicating user {id}
      </p>
    </div>
  );
}