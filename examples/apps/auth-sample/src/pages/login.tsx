import {useState, useEffect} from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {AuthLayout} from '../components/Layouts/AuthLayout';
import {TextField} from '../components/Fields';
import {StatusType, Toast} from '../components/Toasts';
import openfort from '../utils/openfortConfig';
import {getURL} from '../utils/getUrl';
import {
  AuthPlayerResponse,
  OAuthProvider,
} from '@openfort/openfort-js';
import { Button } from '@/components/ui/button';

function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusType>(null);
  const [user, setUser] = useState<AuthPlayerResponse | null>(null);

  useEffect(() => {
    if (
      router.query.access_token &&
      router.query.refresh_token &&
      router.query.player_id
    ) {
      setStatus({
        type: 'loading',
        title: 'Signing in...',
      });
      openfort.storeCredentials({
        player: router.query.player_id as string,
        accessToken: router.query.access_token as string,
        refreshToken: router.query.refresh_token as string,
      });
      location.href = '/';
    }
  }, [router.query]);

  useEffect(() => {
    const fetchUser = async () => {
      const sessionData = await openfort.getUser().catch((error: Error) => {
        console.log('error', error);
      });
      if (sessionData) setUser(sessionData);
    };
    fetchUser();
  }, [openfort]);

  const [show, setShow] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setStatus({
        type: 'loading',
        title: 'Signing in...',
      });

      router.push('/');
    };

    if (user) loadData();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setStatus({
      type: 'loading',
      title: 'Signing in...',
    });
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    event.preventDefault();

    const data = await openfort
      .logInWithEmailPassword({
        email: email,
        password: password,
      })
      .catch((error) => {
        setStatus({
          type: 'error',
          title: 'Error signing in',
        });
      });
    if (data) {
      setStatus({
        type: 'success',
        title: 'Successfully signed in',
      });
      router.push('/');
    }
  };

  return (
    <>
      <Head>
        <title>Openfort Login | Sign in to the Openfort Dashboard</title>
        <meta
          name="description"
          content="Sign in to the Openfort Dashboard to manage your game accounts and more."
        />
      </Head>
      <AuthLayout
        title="Sign in to account"
        subtitle={
          <>
            Don’t have an account?{' '}
            <Link href="/register" className="text-blue-600">
              Sign up
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <TextField
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              id="password"
              name="password"
              show={show}
              setShow={setShow}
              type="password"
              autoComplete="current-password"
              required
            />
            <div className="flex w-full flex-row-reverse ">
              <Button
                variant="link"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/forgot-password')
                }}
                className="text-blue-600"
              >
                Forgot password?
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign in to account
          </Button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div>
              <Button
                onClick={async () => {
                  const {url} = await openfort.initOAuth({
                    provider: OAuthProvider.GOOGLE,
                    options: {
                      redirectTo: getURL() + '/login',
                    },
                  });
                  window.location.href = url;
                }}
                variant="outline"
                className="w-full"
              >
                <span>Continue with Google</span>
              </Button>
            </div>
            <div>
              <Button
                onClick={async () => {
                  const {url} = await openfort.initOAuth({
                    provider: OAuthProvider.TWITTER,
                    options: {
                      redirectTo: getURL() + '/login',
                    },
                  });
                  window.location.href = url;
                }}
                variant="outline"
                className="w-full"
                >
                <p>Continue with Twitter</p>
              </Button>
            </div>
            <div>
              <Button
                onClick={async () => {
                  const {url} = await openfort.initOAuth({
                    provider: OAuthProvider.FACEBOOK,
                    options: {
                      redirectTo: getURL() + '/login',
                    },
                  });
                  window.location.href = url;
                }}
                variant="outline"
                className="w-full"
                >
                <p>Continue with Facebook</p>
              </Button>
            </div>
            <div>
              <Button
              onClick={() => router.push('/connect-wallet')}
                variant="outline"
                className="w-full"
              >
                <p>Continue with wallet</p>
              </Button>
            </div>
          </div>
        </div>
        <Toast status={status} setStatus={setStatus} />
      </AuthLayout>
    </>
  );
}

export default LoginPage;
