import DoctorsList from '@/components/admin/doctor/DoctorList'
import React from 'react'

import Layout from '@/components/admin/layout/Layout'



const DoctorListing = () => {
  return (
    <div>
      <Layout>
      <DoctorsList/>
      </Layout>
    </div>
  )
}

export default DoctorListing
