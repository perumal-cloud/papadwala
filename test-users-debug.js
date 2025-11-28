const { MongoClient } = require('mongodb');

async function testUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('papad');
    const users = await db.collection('users').find({}).limit(5).toArray();
    
    console.log('Found users:', users.length);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('  _id:', user._id);
      console.log('  _id type:', typeof user._id);
      console.log('  _id toString:', user._id.toString());
      console.log('  name:', user.name);
      console.log('  email:', user.email);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testUsers();