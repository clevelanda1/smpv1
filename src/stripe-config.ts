export const STRIPE_PRODUCTS = {
  starter: {
    id: 'prod_SJPnUQkUD4Nm2D',
    priceId: 'price_1ROmy3AdgMakcX19ZcW0dm9B',
    name: 'Storybook Starter',
    description: 'StoryMagic Basic: Monthly package of 20 personalized children\'s stories featuring character customization, adjustable story lengths, advanced content options, and saved templates. Perfect for regular reading adventures.',
    price: 5.99,
    mode: 'subscription' as const,
  },
  family: {
    id: 'prod_SJPo1nM1TgTuoL',
    priceId: 'price_1ROmz0AdgMakcX19zsnEttn0',
    name: 'Family Magic Plan',
    description: 'StoryMagic Premium: Unlimited personalized children\'s stories with full character customization, flexible story lengths, advanced content options, and the ability to save favorite story templates. Designed to grow with your child\'s imagination.',
    price: 11.99,
    mode: 'subscription' as const,
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PRODUCTS;