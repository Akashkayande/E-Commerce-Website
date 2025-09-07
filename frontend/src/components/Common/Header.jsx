import React from 'react'
import Topbar from '../Layout/Topbar'
import Navbar from './Navbar'

const Header = () => {
  return (
    <div className='border-b border-gray-200'>
        <Topbar/>
        <Navbar/>
    </div>
  )
}

export default Header