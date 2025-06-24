import Counter from '@/components/Counter'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function UnderDevelopment() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <Image
          src="http://res.cloudinary.com/dfakxuy7c/image/upload/v1750740986/rxeqk2sbhl3es4dai6tu.avif" // Đặt ảnh tại public/under-construction.svg
          alt="Under development"
          width={300}
          height={300}
          className="mx-auto mb-6"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Page Under Development
        </h1>
        <p className="text-gray-600 mb-6">
          The page is currently under development. Please come back after receiving notice from the admin.
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
