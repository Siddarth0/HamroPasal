import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utils/api-error';
import { upsertGoogleUser } from './auth.service';

// Google sign-in is optional: the strategy constructor throws if clientID is
// missing, so we only register it when creds are present. Routes check this flag
// and return 503 when it's not configured.
export const isGoogleOAuthConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

if (isGoogleOAuthConfigured) {
  // Stateless: we issue our own JWTs after the OAuth handshake, so no
  // serialize/deserialize or sessions are configured. Routes use
  // `passport.authenticate('google', { session: false })`.
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new ApiError('Google account has no email', 400));
          }

          const user = await upsertGoogleUser({
            providerId: profile.id,
            email,
            name: profile.displayName || email.split('@')[0],
            avatarUrl: profile.photos?.[0]?.value,
          });

          // Becomes req.user — matches the AuthPrincipal shape.
          return done(null, {
            userId: user.id,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          });
        } catch (err) {
          return done(err as Error);
        }
      },
    ),
  );
} else {
  console.warn('⚠️  Google OAuth disabled (GOOGLE_CLIENT_ID/SECRET not set)');
}

export default passport;
