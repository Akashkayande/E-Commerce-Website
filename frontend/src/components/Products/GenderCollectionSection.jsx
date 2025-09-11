import React from 'react'
import { Link } from 'react-router-dom'
import womenShoping from "./../../assets/women-shoping.jpg"
import menShoping from "./../../assets/men-shopping.jpg"

const GenderCollectionSection = () => {
  return (
    <div className='pt-17 px-4 lg:px-0'>
        <div className="container mx-auto flex flex-col md:flex-row gap-8 ">
            <div className="relative flex-1">
                <img src={womenShoping} alt="women" className='w-full h-[600px] object-cover' />
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4 ">
                    <h2 className='text-2xl font-bold text-gray-900 mb-3'>Women's Collection</h2>
                    <Link to='/collections/all?gender=Women' className='text-gray-900 underline'>
                        Shop Now
                    </Link>
                </div>
            </div>

            <div className="relative flex-1">
                <img src={menShoping} alt="mens collections" className='w-full h-[600px] object-cover' />
                <div className="absolute bottom-8 left-8 bg-white bg-opacity-90 p-4 ">
                    <h2 className='text-2xl font-bold text-gray-900 mb-3'>Men's Collection</h2>
                    <Link to='/collections/all?gender=Men' className='text-gray-900 underline'>
                        Shop Now
                    </Link>
                </div>
            </div>

        </div>
    </div>
  )
}

export default GenderCollectionSection