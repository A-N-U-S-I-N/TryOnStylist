import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="font-extrabold tracking-widest text-gray-200 text-9xl">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-widest uppercase">Page Not Found</h2>
      <p className="mt-4 mb-8 text-gray-500">Sorry, the page you are looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button variant="primary" size="lg">Return Home</Button>
      </Link>
    </div>
  );
}