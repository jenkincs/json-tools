export const COMMON_JSONPATH_EXAMPLES = [
  {
    label: 'Root object',
    path: '$'
  },
  {
    label: 'Get store object',
    path: '$.store'
  },
  {
    label: 'Get all books',
    path: '$.store.book[*]'
  },
  {
    label: 'Get first book',
    path: '$.store.book[0]'
  },
  {
    label: 'Get book titles',
    path: '$.store.book[*].title'
  },
  {
    label: 'Get in-stock books',
    path: '$.store.book[?(@.inStock==true)]'
  }
]

export const TEST_DATA = {
  store: {
    book: [
      {
        category: 'fiction',
        author: 'J.K. Rowling',
        title: 'Harry Potter',
        price: 9.99,
        inStock: true,
        tags: ['magic', 'fantasy']
      },
      {
        category: 'fiction',
        author: 'George R.R. Martin',
        title: 'Game of Thrones',
        price: 19.99,
        inStock: true,
        tags: ['fantasy', 'medieval']
      },
      {
        category: 'non-fiction',
        author: 'Yuval Noah Harari',
        title: 'Sapiens',
        price: 24.99,
        inStock: false,
        tags: ['history', 'science']
      }
    ],
    bicycle: {
      color: 'red',
      price: 199.99,
      inStock: true
    },
    location: {
      city: 'New York',
      country: 'USA'
    }
  }
}

export const QUERY_EXAMPLES = [
  {
    label: 'Get entire data',
    path: '$'
  },
  {
    label: 'Get store object',
    path: '$.store'
  },
  {
    label: 'Get all books',
    path: '$.store.book[*]'
  },
  {
    label: 'Get first book',
    path: '$.store.book[0]'
  },
  {
    label: 'Get second book',
    path: '$.store.book[1]'
  },
  {
    label: 'Get first book title',
    path: '$.store.book[0].title'
  },
  {
    label: 'Get all book titles',
    path: '$.store.book[*].title'
  },
  {
    label: 'Get all book authors',
    path: '$.store.book[*].author'
  },
  {
    label: 'Get in-stock books',
    path: '$.store.book[?(@.inStock==true)]'
  },
  {
    label: 'Get books over $10',
    path: '$.store.book[?(@.price>10)]'
  },
  {
    label: 'Get books under $10',
    path: '$.store.book[?(@.price<10)]'
  },
  {
    label: 'Get bicycle details',
    path: '$.store.bicycle'
  },
  {
    label: 'Get store location',
    path: '$.store.location'
  }
] 