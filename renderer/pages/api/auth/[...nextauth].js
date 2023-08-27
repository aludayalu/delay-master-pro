import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
    session: {
        strategy: 'jwt'
    },
    providers: [
        GoogleProvider({
        clientId: "60812214489-gihodjv96mo6jql64gmd7ka7n38anulf.apps.googleusercontent.com",
        clientSecret: "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",
        }),
    ],
    secret: "6dfe7cfe1525be1479ea8506f38edaa9",
})