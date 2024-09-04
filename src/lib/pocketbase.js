import PocketBase from 'pocketbase';
const pb = new PocketBase('https://doctors-admin.pockethost.io/');

pb.autoCancellation(false);

export default pb;
