import DoctorsList from '@/components/user/admin/doctor/DoctorList'
import React from 'react'

import Layout from '@/components/user/admin/layout/Layout'



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
