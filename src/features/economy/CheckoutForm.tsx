import React, { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'

interface CheckoutFormProps {
  amount: number
  gems: number
  onSuccess: () => void
  onCancel: () => void
}

export default function CheckoutForm({ amount, gems, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred')
      } else {
        setMessage('An unexpected error occurred.')
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60">Purchase</span>
          <span className="text-white font-bold">{gems} Gems</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60">Total</span>
          <span className="text-white font-bold">${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement id="payment-element" />
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
        >
          Cancel
        </button>
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
        >
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
          </span>
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          id="payment-message"
          className="text-red-400 text-sm text-center font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20"
        >
          {message}
        </motion.div>
      )}
    </form>
  )
}
