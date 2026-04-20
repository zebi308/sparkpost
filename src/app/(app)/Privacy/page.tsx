export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px', fontFamily: 'sans-serif', color: '#111', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: April 2026</p>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>What we collect</h2>
      <p style={{ marginBottom: '24px' }}>SparkPost collects your email address for account creation, your Shopify store domain and OAuth access token to fetch products, and your API keys for Gemini and Zernio which are stored encrypted in our database.</p>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>How we use it</h2>
      <p style={{ marginBottom: '24px' }}>We use your Shopify access to read product listings only. We never write to your store, never access customer data, orders, or financials. Your API keys are used solely to run the automation pipeline on your behalf.</p>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Data storage</h2>
      <p style={{ marginBottom: '24px' }}>All data is stored in Supabase (PostgreSQL) with row-level security. Each user can only access their own data. We do not sell or share your data with third parties.</p>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Shopify data</h2>
      <p style={{ marginBottom: '24px' }}>SparkPost accesses your Shopify store solely to read published product listings and images. We do not store product data permanently — it is fetched at post time and used only to generate the Instagram content.</p>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Deleting your data</h2>
      <p style={{ marginBottom: '24px' }}>You can delete your account and all associated data at any time by contacting us. Shopify merchants can also revoke access by uninstalling the app from their Shopify admin.</p>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Contact</h2>
      <p>For any privacy questions email us at privacy@sparkpost.app</p>
    </div>
  )
}