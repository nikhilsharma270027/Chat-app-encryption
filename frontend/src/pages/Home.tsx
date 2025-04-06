// import React from 'react'
import List from '@/components/List'

const Home = () => {
  return (
    <div>
      <List Profile={undefined} groupMembers={[]} setgroupMembers={function (val: any[]): void {
        throw new Error('Function not implemented.')
      } } socket={undefined} />
    </div>
  )
}

export default Home
