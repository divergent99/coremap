import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const db = DynamoDBDocumentClient.from(client)

export async function saveUser(userId: string, background: string, goal: string) {
  await db.send(new PutCommand({
    TableName: 'coremap-users',
    Item: {
      userID: userId,
      background,
      goal,
      createdAt: new Date().toISOString(),
    },
  }))
}

export async function saveProgress(userId: string, conceptId: string, status: 'done' | 'undone') {
  await db.send(new PutCommand({
    TableName: 'coremap-progress',
    Item: {
      userID: userId,
      conceptId,
      status,
      updatedAt: new Date().toISOString(),
    },
  }))
}

export async function getProgress(userId: string) {
  const result = await db.send(new QueryCommand({
    TableName: 'coremap-progress',
    KeyConditionExpression: 'userID = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  }))
  return result.Items ?? []
}