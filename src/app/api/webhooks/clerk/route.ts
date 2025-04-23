import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    //console.log('Webhook payload:', evt.data)
    
    if (eventType === 'user.created') {
      console.log('User created event received:', evt.data.id)
      
      try {
        // Check if account already exists
        const existingAccount = await prisma.account.findUnique({
          where: { userId: evt.data.id }
        })

        if (existingAccount) {
          console.log('Account already exists for user:', evt.data.id)
          return new NextResponse('Account already exists', { status: 200 })
        }

        // Create the account using Prisma
        const newAccount = await prisma.account.create({
          data: {
            userId: evt.data.id,
            // Prisma handles default values for createdAt, updatedAt, status
          }
        })

        console.log('New account created:', newAccount)
      } catch (error) {
        console.error('Error creating account:', error)
        return new NextResponse('Error creating account', { status: 500 })
      }
    }

    console.log(`Webhook body: ${JSON.stringify(evt.data)}`)
    
    return new NextResponse('', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}