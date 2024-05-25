import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Wallet from 'App/Models/Wallet'
import WalletTransaction from 'App/Models/WalletTransaction'
import Database from '@ioc:Adonis/Lucid/Database'

export default class WalletsController {
  /**
   * Create a new wallet for a user.
   */
  public async create({ request, response }: HttpContextContract) {
    const userId = request.input('user_id')
    const wallet = await Wallet.create({ userId })

    return response.status(201).json({ wallet })
  }

  /**
   * Get wallet balance for a user.
   */
  public async getBalance({ params, response }: HttpContextContract) {
    const userId = params.id
    const wallet = await Wallet.query().where('user_id', userId).first()

    if (!wallet) {
      return response.status(404).json({ message: 'Wallet not found' })
    }

    return response.json({ balance: wallet.balance })
  }

  /**
   * Perform a transaction (credit or debit) on a user's wallet.
   */
  public async performTransaction({ request, response }: HttpContextContract) {
    const userId = request.input('user_id')
    const amount = request.input('amount')
    const type = request.input('type') // 'credit' or 'debit'
    const description = request.input('description')

    const wallet = await Wallet.query().where('user_id', userId).first()

    if (!wallet) {
      return response.status(404).json({ message: 'Wallet not found' })
    }

    if (type === 'credit') {
      // Credit (add funds) to the wallet
      wallet.balance += amount
    } else if (type === 'debit') {
      // Debit (subtract funds) from the wallet
      if (amount > wallet.balance) {
        return response.status(400).json({ message: 'Insufficient balance' })
      }
      wallet.balance -= amount
    } else {
      return response.status(400).json({ message: 'Invalid transaction type' })
    }

    await Database.transaction(async (trx) => {
      // Use a database transaction to ensure atomicity of the wallet update and transaction creation
      await wallet.useTransaction(trx).save()

      // Log the transaction
      await WalletTransaction.create({
        walletId: wallet.id,
        amount,
        type,
        description,
      })
    })

    return response.status(200).json({ message: 'Transaction completed' })
  }

  // List Transactions
  public async listTransactions({ params, request, response }: HttpContextContract) {
    const userId = params.id
    const wallet = await Wallet.query().where('userId', userId).first()

    if (!wallet) {
      return response.status(404).json({ message: 'Wallet not found' })
    }

    // Get filter criteria from the request's query parameters
    const filters = request.qs()
    const query = wallet.related('transactions').query()

    // Apply filters
    if (filters.startDate && filters.endDate) {
      // Filter transactions within a date range
      query.whereBetween('created_at', [filters.startDate, filters.endDate])
    }

    if (filters.transactionType) {
      // Filter transactions by type (credit/debit)
      query.where('type', filters.transactionType)
    }

    const transactions = await query

    return response.json({ transactions })
  }

  // Revert Transaction
  public async revertTransaction({ params, response }: HttpContextContract) {
    const transactionId = params.id

    // Retrieve the original transaction
    const transaction = await WalletTransaction.findOrFail(transactionId)

    if (!transaction) {
      return response.status(404).json({
        message: 'Transaction not found.',
      })
    }

    // Check if the transaction has already been reversed
    if (transaction.reversed) {
      return response.status(400).json({
        message: 'This transaction has already been reversed.',
      })
    }

    // Create a new transaction to reverse the original transaction
    const reversedTransaction = new WalletTransaction()
    reversedTransaction.type = 'reversal'
    reversedTransaction.amount = -transaction.amount
    reversedTransaction.walletId = transaction.walletId
    reversedTransaction.reversedTransactionId = transaction.id // Link it to the original transaction

    await Database.transaction(async (trx) => {
      // Use a database transaction to ensure atomicity of the reversal transaction
      await reversedTransaction.useTransaction(trx).save()

      // Mark the original transaction as reversed
      transaction.reversed = true
      await transaction.useTransaction(trx).save()
    })

    return response.status(200).json({
      message: 'Transaction successfully reversed.',
    })
  }

  //WALLET TOPUP
  public async topUp({ request, response }: HttpContextContract) {
    const userId = request.input('user_id')
    const amount = request.input('amount')
    const roundedAmount = Number(amount.toFixed(2))

    // Find the user's wallet
    const wallet = await Wallet.query().where('user_id', userId).first()

    if (!wallet) {
      return response.status(404).json({ message: 'Wallet not found' })
    }

    // Validate and add the amount to the balance
    if (amount <= 0) {
      return response.status(400).json({ message: 'Invalid amount' })
    }

    wallet.balance += roundedAmount

    // Log the transaction as a credit
    await WalletTransaction.create({
      walletId: wallet.id,
      amount: roundedAmount,
      type: 'credit',
      description: 'Top-up',
    })

    await wallet.save()

    return response
      .status(200)
      .json({ message: 'Rs ' + roundedAmount + ' ' + 'Balance added successfully' })
  }
}
