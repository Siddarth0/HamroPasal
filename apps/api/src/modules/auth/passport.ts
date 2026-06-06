import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@/config/env';
import { ApiError } from '@/shared/utils/api-error';
import { upsertGoogleUser } from './auth.service';

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
        const email = profile.emails?.[0]?.value;
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
        return done(null, { userId: user.id, role: user.role });
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

export default passport;
