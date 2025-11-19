// Type definitions for PouchDB and related plugins

declare module 'pouchdb' {
  const PouchDB: any;
  export default PouchDB;
}

declare module 'pouchdb-find' {
  const PouchDBFind: any;
  export default PouchDBFind;
}

declare module 'pouchdb-adapter-memory' {
  const PouchDBMemory: any;
  export default PouchDBMemory;
}

declare module 'pouchdb-adapter-http' {
  const PouchDBHttp: any;
  export default PouchDBHttp;
}

declare module 'pouchdb-replication' {
  const PouchDBReplication: any;
  export default PouchDBReplication;
}