export const COMMON_JSONPATH_EXAMPLES = [
  {
    label: 'example1',
    path: '$'
  },
  {
    label: 'example2',
    path: '$.store'
  },
  {
    label: 'example3',
    path: '$.store.book[*]'
  },
  {
    label: 'example4',
    path: '$.store.book[0]'
  },
  {
    label: 'example5',
    path: '$.store.book[*].title'
  },
  {
    label: 'example6',
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
    label: 'example1',
    path: '$'
  },
  {
    label: 'example2',
    path: '$.store'
  },
  {
    label: 'example3',
    path: '$.store.book[*]'
  },
  {
    label: 'example4',
    path: '$.store.book[0]'
  },
  {
    label: 'example5',
    path: '$.store.book[1]'
  },
  {
    label: 'example6',
    path: '$.store.book[0].title'
  },
  {
    label: 'example7',
    path: '$.store.book[*].title'
  },
  {
    label: 'example8',
    path: '$.store.book[*].author'
  },
  {
    label: 'example9',
    path: '$.store.book[?(@.inStock==true)]'
  },
  {
    label: 'example10',
    path: '$.store.book[?(@.price>10)]'
  },
  {
    label: 'example11',
    path: '$.store.book[?(@.price<10)]'
  },
  {
    label: 'example12',
    path: '$.store.bicycle'
  },
  {
    label: 'example13',
    path: '$.store.location'
  }
] 