import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { ECONOMY_CONFIG } from '@/features/economy/economyStore'
import CheckoutForm from '@/features/economy/CheckoutForm'

// In a real app, this should be an environment variable
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx')

export default function PaymentPage() {
  const { user } = useAuthStore()
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const packages = ECONOMY_CONFIG.gemPackages

  const handleSelectPackage = async (pkg: any) => {
    setSelectedPackage(pkg)
    setIsLoading(true)
    setShowCheckout(true)

    try {
      // Create PaymentIntent as soon as the package is selected
      // In a real app, you would make an API call to your backend
      /*
      const res = await fetch('http://localhost:8080/api/v1/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: pkg.gems }], userId: user?.id }),
      });
      const { clientSecret } = await res.json();
      setClientSecret(clientSecret);
      */
     
      // Mocking the client secret for demo purposes
      setTimeout(() => {
        setClientSecret('pi_123_secret_456')
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to create payment intent:', error)
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPurchaseSuccess(true)
    setTimeout(() => {
      setShowCheckout(false)
      setPurchaseSuccess(false)
      setSelectedPackage(null)
      // In a real app, we would reload user economy here
      // useEconomyStore.getState().loadUserEconomy()
    }, 3000)
  }

  const handlePaymentCancel = () => {
    setShowCheckout(false)
    setSelectedPackage(null)
    setClientSecret('')
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#ec4899', // pink-500
      colorBackground: '#1e1b4b', // indigo-950
      colorText: '#ffffff',
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Gem Store
        </h1>
        <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto text-lg">
          Get more gems to unlock exclusive pets, decorations, and premium battle pass rewards!
        </p>

        {!showCheckout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectPackage(pkg)}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 cursor-pointer shadow-xl relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shine" />
                
                <div className="flex flex-col items-center">
                  <span className="text-6xl mb-4 drop-shadow-lg">💎</span>
                  <h3 className="text-3xl font-black text-white mb-2">{pkg.gems}</h3>
                  <span className="text-white/60 font-semibold mb-6 uppercase tracking-wider text-sm">Gems</span>
                  
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 w-full py-3 rounded-xl flex justify-center items-center group-hover:from-pink-400 group-hover:to-purple-400 transition-colors">
                    <span className="text-white font-bold text-lg">${pkg.price.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-xl mx-auto"
          >
            {purchaseSuccess ? (
              <div className="text-center py-12">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                >
                  <span className="text-white text-5xl">✓</span>
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
                <p className="text-white/80 text-lg">
                  You have successfully purchased <strong className="text-pink-400">{selectedPackage?.gems} Gems</strong>.
                </p>
                <p className="text-white/60 mt-4 text-sm">Redirecting to store...</p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Checkout</h2>
                  <p className="text-white/60">Complete your secure payment below</p>
                </div>
                
                {isLoading || !clientSecret ? (
                  <div className="flex flex-col justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-white/60 font-medium animate-pulse">Initializing secure payment...</p>
                  </div>
                ) : (
                  <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                    <CheckoutForm 
                      amount={Math.round(selectedPackage.price * 100)} 
                      gems={selectedPackage.gems} 
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </Elements>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
