export const govSectors = [
  'IAS / Administrative',
  'Police / IPS',
  'Education',
  'Health & Medical',
  'Public Works',
  'Revenue',
  'Agriculture',
  'Forest',
  'Railway',
  'Banking (PSU)',
  'Post Office',
  'Defence',
];

export const sectorIcons = {
  'IAS / Administrative': '🏛️',
  'Police / IPS': '👮',
  'Education': '🎓',
  'Health & Medical': '🏥',
  'Public Works': '🔧',
  'Revenue': '📋',
  'Agriculture': '🌾',
  'Forest': '🌲',
  'Railway': '🚂',
  'Banking (PSU)': '🏦',
  'Post Office': '📮',
  'Defence': '🪖',
};

export const sectorColors = {
  'IAS / Administrative': 'from-orange-500 to-orange-700',
  'Police / IPS': 'from-blue-600 to-blue-800',
  'Education': 'from-green-500 to-green-700',
  'Health & Medical': 'from-red-500 to-red-700',
  'Public Works': 'from-yellow-500 to-yellow-700',
  'Revenue': 'from-indigo-500 to-indigo-700',
  'Agriculture': 'from-lime-500 to-lime-700',
  'Forest': 'from-emerald-600 to-emerald-800',
  'Railway': 'from-gray-600 to-gray-800',
  'Banking (PSU)': 'from-cyan-600 to-cyan-800',
  'Post Office': 'from-pink-500 to-pink-700',
  'Defence': 'from-slate-600 to-slate-800',
};

export const govEmployees = {
  'west-bengal': [
    { id: 'wb001', name: 'Anirban Chatterjee', designation: 'IAS Officer (DM)', department: 'District Administration', sector: 'IAS / Administrative', salary: 125000, joiningDate: '2018-07-15', pan: 'GOVWB001A', district: 'Kolkata', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'wb002', name: 'Suparna Ghosh', designation: 'BDO', department: 'Block Development', sector: 'IAS / Administrative', salary: 72000, joiningDate: '2015-03-10', pan: 'GOVWB002B', district: 'Howrah', grade: 'Grade B', serviceType: 'WBCS' },
    { id: 'wb011', name: 'Subhajit Mukherjee', designation: 'SDO', department: 'Sub-Divisional Office', sector: 'IAS / Administrative', salary: 68000, joiningDate: '2017-09-01', pan: 'GOVWB011K', district: 'Bardhaman', grade: 'Grade B', serviceType: 'WBCS' },
    { id: 'wb003', name: 'Rajib Biswas', designation: 'Inspector of Police', department: 'WB Police', sector: 'Police / IPS', salary: 68000, joiningDate: '2016-08-20', pan: 'GOVWB003C', district: 'Murshidabad', grade: 'Grade B', serviceType: 'WB Police' },
    { id: 'wb004', name: 'Mithun Dey', designation: 'Sub-Inspector', department: 'WB Police', sector: 'Police / IPS', salary: 42000, joiningDate: '2019-04-01', pan: 'GOVWB004D', district: 'Nadia', grade: 'Grade C', serviceType: 'WB Police' },
    { id: 'wb012', name: 'Prosenjit Sarkar', designation: 'Constable', department: 'WB Police', sector: 'Police / IPS', salary: 28000, joiningDate: '2021-01-15', pan: 'GOVWB012L', district: 'Birbhum', grade: 'Grade C', serviceType: 'WB Police' },
    { id: 'wb005', name: 'Mousumi Roy', designation: 'Assistant Teacher', department: 'School Education', sector: 'Education', salary: 38000, joiningDate: '2017-06-15', pan: 'GOVWB005E', district: 'North 24 Parganas', grade: 'Grade C', serviceType: 'WBSSC' },
    { id: 'wb013', name: 'Santanu Ghosh', designation: 'Headmaster', department: 'School Education', sector: 'Education', salary: 54000, joiningDate: '2010-07-01', pan: 'GOVWB013M', district: 'South 24 Parganas', grade: 'Grade B', serviceType: 'WBSSC' },
    { id: 'wb014', name: 'Puja Das', designation: 'Assistant Professor', department: 'Higher Education', sector: 'Education', salary: 72000, joiningDate: '2016-08-01', pan: 'GOVWB014N', district: 'Hooghly', grade: 'Grade B', serviceType: 'WB Higher Edu' },
    { id: 'wb006', name: 'Dr. Tanmoy Pal', designation: 'Medical Officer', department: 'Health & Family Welfare', sector: 'Health & Medical', salary: 95000, joiningDate: '2014-11-01', pan: 'GOVWB006F', district: 'Bardhaman', grade: 'Grade A', serviceType: 'WB Health' },
    { id: 'wb015', name: 'Dr. Priya Mondal', designation: 'CMOH', department: 'Health Department', sector: 'Health & Medical', salary: 110000, joiningDate: '2012-05-20', pan: 'GOVWB015O', district: 'Midnapore', grade: 'Grade A', serviceType: 'WB Health' },
    { id: 'wb016', name: 'Nurse Rina Dey', designation: 'Staff Nurse', department: 'SSKM Hospital', sector: 'Health & Medical', salary: 35000, joiningDate: '2019-03-10', pan: 'GOVWB016P', district: 'Kolkata', grade: 'Grade C', serviceType: 'WB Health' },
    { id: 'wb007', name: 'Soumya Bose', designation: 'Revenue Inspector', department: 'Revenue Department', sector: 'Revenue', salary: 35000, joiningDate: '2020-02-10', pan: 'GOVWB007G', district: 'Birbhum', grade: 'Grade C', serviceType: 'WBCS' },
    { id: 'wb008', name: 'Kalyani Sen', designation: 'Agriculture Officer', department: 'Agriculture Dept', sector: 'Agriculture', salary: 52000, joiningDate: '2013-09-05', pan: 'GOVWB008H', district: 'Midnapore West', grade: 'Grade B', serviceType: 'WBCS' },
    { id: 'wb009', name: 'Partha Sarathi Mukherjee', designation: 'Forest Ranger', department: 'Forest Dept', sector: 'Forest', salary: 48000, joiningDate: '2016-07-20', pan: 'GOVWB009I', district: 'Jhargram', grade: 'Grade B', serviceType: 'WB Forest' },
    { id: 'wb010', name: 'Rima Haldar', designation: 'Postmaster', department: 'India Post', sector: 'Post Office', salary: 31000, joiningDate: '2018-10-15', pan: 'GOVWB010J', district: 'Cooch Behar', grade: 'Grade C', serviceType: 'Central' },
    { id: 'wb017', name: 'Amitava Saha', designation: 'Junior Engineer', department: 'PWD Bengal', sector: 'Public Works', salary: 44000, joiningDate: '2020-06-01', pan: 'GOVWB017Q', district: 'Jalpaiguri', grade: 'Grade C', serviceType: 'WB PWD' },
  ],

  'uttar-pradesh': [
    { id: 'up001', name: 'Vivek Kumar Singh', designation: 'IAS Officer (Commissioner)', department: 'Divisional Administration', sector: 'IAS / Administrative', salary: 145000, joiningDate: '2012-07-01', pan: 'GOVUP001A', district: 'Lucknow', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'up006', name: 'Pradeep Tripathi', designation: 'BDO', department: 'Block Development', sector: 'IAS / Administrative', salary: 65000, joiningDate: '2018-04-15', pan: 'GOVUP006F', district: 'Gorakhpur', grade: 'Grade B', serviceType: 'PCS' },
    { id: 'up002', name: 'Ananya Srivastava', designation: 'SDM', department: 'Revenue', sector: 'Revenue', salary: 65000, joiningDate: '2017-08-15', pan: 'GOVUP002B', district: 'Varanasi', grade: 'Grade B', serviceType: 'PCS' },
    { id: 'up007', name: 'Ramesh Mishra', designation: 'Lekhpal', department: 'Revenue Department', sector: 'Revenue', salary: 28000, joiningDate: '2019-09-01', pan: 'GOVUP007G', district: 'Agra', grade: 'Grade C', serviceType: 'UP Revenue' },
    { id: 'up003', name: 'Rakesh Tiwari', designation: 'DSP', department: 'UP Police', sector: 'Police / IPS', salary: 78000, joiningDate: '2015-04-10', pan: 'GOVUP003C', district: 'Agra', grade: 'Grade B', serviceType: 'PPS' },
    { id: 'up008', name: 'Sunil Yadav', designation: 'SI', department: 'UP Police', sector: 'Police / IPS', salary: 42000, joiningDate: '2020-03-01', pan: 'GOVUP008H', district: 'Prayagraj', grade: 'Grade C', serviceType: 'UP Police' },
    { id: 'up004', name: 'Dr. Sunita Gupta', designation: 'Chief Medical Officer', department: 'Health Department', sector: 'Health & Medical', salary: 110000, joiningDate: '2010-11-05', pan: 'GOVUP004D', district: 'Kanpur', grade: 'Grade A', serviceType: 'UP Health' },
    { id: 'up009', name: 'Ritu Sharma', designation: 'ASHA Supervisor', department: 'NHM UP', sector: 'Health & Medical', salary: 32000, joiningDate: '2018-06-01', pan: 'GOVUP009I', district: 'Meerut', grade: 'Grade C', serviceType: 'UP Health' },
    { id: 'up005', name: 'Mahesh Yadav', designation: 'Junior Engineer', department: 'PWD', sector: 'Public Works', salary: 42000, joiningDate: '2019-06-20', pan: 'GOVUP005E', district: 'Allahabad', grade: 'Grade C', serviceType: 'UP PWD' },
    { id: 'up010', name: 'Sangeeta Verma', designation: 'Assistant Teacher', department: 'Basic Education', sector: 'Education', salary: 35000, joiningDate: '2021-01-20', pan: 'GOVUP010J', district: 'Bareilly', grade: 'Grade C', serviceType: 'UP Basic Edu' },
    { id: 'up011', name: 'Amit Pandey', designation: 'Agriculture Inspector', department: 'Agriculture', sector: 'Agriculture', salary: 38000, joiningDate: '2017-05-15', pan: 'GOVUP011K', district: 'Faizabad', grade: 'Grade C', serviceType: 'UP Agri' },
  ],

  'maharashtra': [
    { id: 'mh001', name: 'Prashant Deshmukh', designation: 'IAS Officer (Collector)', department: 'District Collectorate', sector: 'IAS / Administrative', salary: 135000, joiningDate: '2014-07-15', pan: 'GOVMH001A', district: 'Pune', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'mh005', name: 'Kavita Jadhav', designation: 'Tehsildar', department: 'Taluka Office', sector: 'IAS / Administrative', salary: 62000, joiningDate: '2016-08-01', pan: 'GOVMH005E', district: 'Nagpur', grade: 'Grade B', serviceType: 'MCS' },
    { id: 'mh002', name: 'Swati Patil', designation: 'Tahsildar', department: 'Revenue', sector: 'Revenue', salary: 58000, joiningDate: '2016-03-10', pan: 'GOVMH002B', district: 'Nashik', grade: 'Grade B', serviceType: 'MCS' },
    { id: 'mh003', name: 'Arun Shinde', designation: 'Police Inspector', department: 'Maharashtra Police', sector: 'Police / IPS', salary: 65000, joiningDate: '2017-09-01', pan: 'GOVMH003C', district: 'Mumbai', grade: 'Grade B', serviceType: 'MPS' },
    { id: 'mh006', name: 'Vijay More', designation: 'PSI', department: 'Maharashtra Police', sector: 'Police / IPS', salary: 40000, joiningDate: '2020-07-01', pan: 'GOVMH006F', district: 'Thane', grade: 'Grade C', serviceType: 'MPS' },
    { id: 'mh004', name: 'Dr. Meena Jadhav', designation: 'Medical Officer', department: 'Public Health', sector: 'Health & Medical', salary: 88000, joiningDate: '2015-12-20', pan: 'GOVMH004D', district: 'Aurangabad', grade: 'Grade A', serviceType: 'MH Health' },
    { id: 'mh007', name: 'Sanjay Kulkarni', designation: 'Assistant Teacher', department: 'ZP Education', sector: 'Education', salary: 36000, joiningDate: '2019-06-15', pan: 'GOVMH007G', district: 'Solapur', grade: 'Grade C', serviceType: 'ZP MH' },
    { id: 'mh008', name: 'Laxmibai Pawar', designation: 'Agriculture Officer', department: 'Agriculture', sector: 'Agriculture', salary: 50000, joiningDate: '2014-04-01', pan: 'GOVMH008H', district: 'Kolhapur', grade: 'Grade B', serviceType: 'MH Agri' },
  ],

  'karnataka': [
    { id: 'ka001', name: 'Suresh Naik', designation: 'IAS Officer (DC)', department: 'District Administration', sector: 'IAS / Administrative', salary: 128000, joiningDate: '2016-07-15', pan: 'GOVKA001A', district: 'Bengaluru', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'ka004', name: 'Priya Gowda', designation: 'Taluk Officer', department: 'Taluk Administration', sector: 'IAS / Administrative', salary: 58000, joiningDate: '2019-03-15', pan: 'GOVKA004D', district: 'Hubli', grade: 'Grade B', serviceType: 'KAS' },
    { id: 'ka002', name: 'Deepa Rao', designation: 'Assistant Commissioner', department: 'Revenue', sector: 'Revenue', salary: 62000, joiningDate: '2018-05-10', pan: 'GOVKA002B', district: 'Mysuru', grade: 'Grade B', serviceType: 'KAS' },
    { id: 'ka003', name: 'Mohan Kumar', designation: 'DySP', department: 'Karnataka Police', sector: 'Police / IPS', salary: 72000, joiningDate: '2015-10-15', pan: 'GOVKA003C', district: 'Mangaluru', grade: 'Grade B', serviceType: 'KPS' },
    { id: 'ka005', name: 'Ravi Hegde', designation: 'PSI', department: 'Karnataka Police', sector: 'Police / IPS', salary: 38000, joiningDate: '2021-06-01', pan: 'GOVKA005E', district: 'Belagavi', grade: 'Grade C', serviceType: 'KPS' },
    { id: 'ka006', name: 'Dr. Suma Nair', designation: 'Medical Officer', department: 'Health Dept', sector: 'Health & Medical', salary: 85000, joiningDate: '2016-09-01', pan: 'GOVKA006F', district: 'Bengaluru', grade: 'Grade A', serviceType: 'KA Health' },
    { id: 'ka007', name: 'Venkatesh B.', designation: 'High School Teacher', department: 'School Education', sector: 'Education', salary: 40000, joiningDate: '2018-07-01', pan: 'GOVKA007G', district: 'Shimoga', grade: 'Grade C', serviceType: 'KPSC' },
  ],

  'tamil-nadu': [
    { id: 'tn001', name: 'S. Ramasubramanian', designation: 'IAS Collector', department: 'Collectorate', sector: 'IAS / Administrative', salary: 130000, joiningDate: '2015-07-15', pan: 'GOVTN001A', district: 'Chennai', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'tn002', name: 'Kavitha Rajan', designation: 'Revenue Divisional Officer', department: 'Revenue', sector: 'Revenue', salary: 60000, joiningDate: '2017-04-01', pan: 'GOVTN002B', district: 'Coimbatore', grade: 'Grade B', serviceType: 'TNPSC' },
    { id: 'tn003', name: 'Murugan P.', designation: 'Inspector of Police', department: 'TN Police', sector: 'Police / IPS', salary: 64000, joiningDate: '2016-03-10', pan: 'GOVTN003C', district: 'Madurai', grade: 'Grade B', serviceType: 'TN Police' },
    { id: 'tn004', name: 'Anitha Selvam', designation: 'SI', department: 'TN Police', sector: 'Police / IPS', salary: 38000, joiningDate: '2020-08-01', pan: 'GOVTN004D', district: 'Trichy', grade: 'Grade C', serviceType: 'TN Police' },
    { id: 'tn005', name: 'Dr. Saravanan M.', designation: 'Government Doctor', department: 'Health Department', sector: 'Health & Medical', salary: 92000, joiningDate: '2013-11-15', pan: 'GOVTN005E', district: 'Salem', grade: 'Grade A', serviceType: 'TN Health' },
    { id: 'tn006', name: 'Lakshmi Devi', designation: 'BT Assistant', department: 'School Education', sector: 'Education', salary: 38000, joiningDate: '2018-06-01', pan: 'GOVTN006F', district: 'Tirunelveli', grade: 'Grade C', serviceType: 'TNPSC' },
    { id: 'tn007', name: 'Thirumurthy K.', designation: 'Agriculture Officer', department: 'Agriculture Dept', sector: 'Agriculture', salary: 48000, joiningDate: '2015-09-01', pan: 'GOVTN007G', district: 'Thanjavur', grade: 'Grade B', serviceType: 'TN Agri' },
  ],

  'rajasthan': [
    { id: 'rj001', name: 'Ramkumar Meena', designation: 'IAS Officer (DM)', department: 'District Administration', sector: 'IAS / Administrative', salary: 132000, joiningDate: '2013-07-01', pan: 'GOVRJ001A', district: 'Jaipur', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'rj002', name: 'Sunita Sharma', designation: 'SDM', department: 'Sub-Division Office', sector: 'IAS / Administrative', salary: 65000, joiningDate: '2018-09-01', pan: 'GOVRJ002B', district: 'Jodhpur', grade: 'Grade B', serviceType: 'RAS' },
    { id: 'rj003', name: 'Bhajanlal Jat', designation: 'DSP', department: 'Rajasthan Police', sector: 'Police / IPS', salary: 75000, joiningDate: '2016-05-01', pan: 'GOVRJ003C', district: 'Udaipur', grade: 'Grade B', serviceType: 'RPS' },
    { id: 'rj004', name: 'Kamla Gurjar', designation: 'Head Teacher', department: 'School Education', sector: 'Education', salary: 44000, joiningDate: '2014-07-15', pan: 'GOVRJ004D', district: 'Kota', grade: 'Grade C', serviceType: 'RPSC' },
    { id: 'rj005', name: 'Dr. Ashok Choudhary', designation: 'PMO', department: 'Medical Health', sector: 'Health & Medical', salary: 88000, joiningDate: '2012-11-01', pan: 'GOVRJ005E', district: 'Ajmer', grade: 'Grade A', serviceType: 'RJ Health' },
    { id: 'rj006', name: 'Narayan Patel', designation: 'Patwari', department: 'Revenue', sector: 'Revenue', salary: 26000, joiningDate: '2021-03-01', pan: 'GOVRJ006F', district: 'Bikaner', grade: 'Grade C', serviceType: 'RAS' },
  ],

  'gujarat': [
    { id: 'gj001', name: 'Hardik Patel', designation: 'IAS Officer (Collector)', department: 'Collectorate', sector: 'IAS / Administrative', salary: 138000, joiningDate: '2014-07-01', pan: 'GOVGJ001A', district: 'Ahmedabad', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'gj002', name: 'Meera Desai', designation: 'Mamlatdar', department: 'Revenue', sector: 'Revenue', salary: 52000, joiningDate: '2017-09-15', pan: 'GOVGJ002B', district: 'Surat', grade: 'Grade B', serviceType: 'GAS' },
    { id: 'gj003', name: 'Ketan Shah', designation: 'Police Inspector', department: 'Gujarat Police', sector: 'Police / IPS', salary: 62000, joiningDate: '2016-07-01', pan: 'GOVGJ003C', district: 'Vadodara', grade: 'Grade B', serviceType: 'GPS' },
    { id: 'gj004', name: 'Dr. Dipa Trivedi', designation: 'Civil Surgeon', department: 'Health Dept', sector: 'Health & Medical', salary: 96000, joiningDate: '2011-10-01', pan: 'GOVGJ004D', district: 'Rajkot', grade: 'Grade A', serviceType: 'GJ Health' },
    { id: 'gj005', name: 'Dhruv Mehta', designation: 'Teacher (TET)', department: 'Primary Education', sector: 'Education', salary: 32000, joiningDate: '2020-06-01', pan: 'GOVGJ005E', district: 'Gandhinagar', grade: 'Grade C', serviceType: 'GPSC' },
    { id: 'gj006', name: 'Bhavna Solanki', designation: 'Junior Engineer', department: 'Roads & Buildings', sector: 'Public Works', salary: 42000, joiningDate: '2019-11-01', pan: 'GOVGJ006F', district: 'Junagadh', grade: 'Grade C', serviceType: 'GJ PWD' },
  ],

  'bihar': [
    { id: 'br001', name: 'Ravi Shankar Singh', designation: 'IAS Officer (DM)', department: 'District Administration', sector: 'IAS / Administrative', salary: 128000, joiningDate: '2015-07-01', pan: 'GOVBR001A', district: 'Patna', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'br002', name: 'Kumari Asha', designation: 'CO (Circle Officer)', department: 'Revenue', sector: 'Revenue', salary: 55000, joiningDate: '2017-10-01', pan: 'GOVBR002B', district: 'Gaya', grade: 'Grade B', serviceType: 'BPSC' },
    { id: 'br003', name: 'Sanjay Kumar Yadav', designation: 'DSP', department: 'Bihar Police', sector: 'Police / IPS', salary: 72000, joiningDate: '2016-06-01', pan: 'GOVBR003C', district: 'Muzaffarpur', grade: 'Grade B', serviceType: 'BPSS' },
    { id: 'br004', name: 'Dr. Rekha Kumari', designation: 'MOIC', department: 'Health & Family Welfare', sector: 'Health & Medical', salary: 85000, joiningDate: '2013-08-01', pan: 'GOVBR004D', district: 'Bhagalpur', grade: 'Grade A', serviceType: 'BR Health' },
    { id: 'br005', name: 'Ramchandra Mahto', designation: 'Primary Teacher', department: 'Education', sector: 'Education', salary: 30000, joiningDate: '2019-08-01', pan: 'GOVBR005E', district: 'Darbhanga', grade: 'Grade C', serviceType: 'BPSC' },
    { id: 'br006', name: 'Vijay Kumar Paswan', designation: 'Agriculture Extension Officer', department: 'Agriculture', sector: 'Agriculture', salary: 40000, joiningDate: '2016-04-15', pan: 'GOVBR006F', district: 'Saran', grade: 'Grade C', serviceType: 'BR Agri' },
  ],

  'delhi': [
    { id: 'dl001', name: 'Vikram Mehta', designation: 'IAS Officer (Secretary)', department: 'Delhi Secretariat', sector: 'IAS / Administrative', salary: 185000, joiningDate: '2010-07-01', pan: 'GOVDL001A', district: 'Central Delhi', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'dl002', name: 'Anjali Kapoor', designation: 'Deputy Commissioner', department: 'Revenue', sector: 'Revenue', salary: 95000, joiningDate: '2013-08-20', pan: 'GOVDL002B', district: 'South Delhi', grade: 'Grade A', serviceType: 'DANICS' },
    { id: 'dl005', name: 'Monika Arora', designation: 'SDM', department: 'Sub-Divisional Magistrate', sector: 'IAS / Administrative', salary: 72000, joiningDate: '2017-07-01', pan: 'GOVDL005E', district: 'West Delhi', grade: 'Grade B', serviceType: 'DANICS' },
    { id: 'dl003', name: 'Rajan Sharma', designation: 'ACP', department: 'Delhi Police', sector: 'Police / IPS', salary: 82000, joiningDate: '2016-04-15', pan: 'GOVDL003C', district: 'North Delhi', grade: 'Grade B', serviceType: 'DPSS' },
    { id: 'dl006', name: 'Preethi Nair', designation: 'SHO', department: 'Delhi Police', sector: 'Police / IPS', salary: 62000, joiningDate: '2018-09-01', pan: 'GOVDL006F', district: 'East Delhi', grade: 'Grade B', serviceType: 'DPSS' },
    { id: 'dl004', name: 'Neha Gupta', designation: 'Teacher (TGT)', department: 'Delhi Education', sector: 'Education', salary: 45000, joiningDate: '2018-07-10', pan: 'GOVDL004D', district: 'East Delhi', grade: 'Grade C', serviceType: 'Delhi Edu' },
    { id: 'dl007', name: 'Dr. Ashish Jain', designation: 'Senior Resident', department: 'AIIMS Delhi', sector: 'Health & Medical', salary: 125000, joiningDate: '2020-01-15', pan: 'GOVDL007G', district: 'New Delhi', grade: 'Grade A', serviceType: 'Central' },
    { id: 'dl008', name: 'Suhas Kumar', designation: 'Junior Engineer', department: 'PWD Delhi', sector: 'Public Works', salary: 46000, joiningDate: '2019-04-01', pan: 'GOVDL008H', district: 'North Delhi', grade: 'Grade C', serviceType: 'Delhi PWD' },
  ],

  'kerala': [
    { id: 'kl001', name: 'Sreedharan Nair', designation: 'IAS Officer (DC)', department: 'Collectorate', sector: 'IAS / Administrative', salary: 126000, joiningDate: '2016-07-01', pan: 'GOVKL001A', district: 'Thiruvananthapuram', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'kl002', name: 'Latha Krishnan', designation: 'Deputy Collector', department: 'Revenue', sector: 'Revenue', salary: 72000, joiningDate: '2017-09-01', pan: 'GOVKL002B', district: 'Ernakulam', grade: 'Grade B', serviceType: 'KAS' },
    { id: 'kl003', name: 'Manoj Pillai', designation: 'DySP', department: 'Kerala Police', sector: 'Police / IPS', salary: 76000, joiningDate: '2015-03-15', pan: 'GOVKL003C', district: 'Kozhikode', grade: 'Grade B', serviceType: 'KPS' },
    { id: 'kl004', name: 'Dr. Sindhu Thomas', designation: 'District Medical Officer', department: 'Health', sector: 'Health & Medical', salary: 98000, joiningDate: '2014-06-01', pan: 'GOVKL004D', district: 'Thrissur', grade: 'Grade A', serviceType: 'KL Health' },
    { id: 'kl005', name: 'Reshma V.', designation: 'UP School Teacher', department: 'General Education', sector: 'Education', salary: 38000, joiningDate: '2019-06-01', pan: 'GOVKL005E', district: 'Palakkad', grade: 'Grade C', serviceType: 'KPSC' },
    { id: 'kl006', name: 'Sunil Kumar P.', designation: 'Forest Officer', department: 'Forest Dept', sector: 'Forest', salary: 52000, joiningDate: '2016-10-01', pan: 'GOVKL006F', district: 'Idukki', grade: 'Grade B', serviceType: 'KL Forest' },
  ],

  'punjab': [
    { id: 'pb001', name: 'Gurpreet Singh', designation: 'IAS Officer (DC)', department: 'Collectorate', sector: 'IAS / Administrative', salary: 128000, joiningDate: '2015-07-01', pan: 'GOVPB001A', district: 'Chandigarh', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'pb002', name: 'Harpreet Kaur', designation: 'SDM', department: 'Revenue', sector: 'Revenue', salary: 62000, joiningDate: '2018-08-01', pan: 'GOVPB002B', district: 'Amritsar', grade: 'Grade B', serviceType: 'PCS' },
    { id: 'pb003', name: 'Manjinder Singh', designation: 'DSP', department: 'Punjab Police', sector: 'Police / IPS', salary: 74000, joiningDate: '2016-04-01', pan: 'GOVPB003C', district: 'Ludhiana', grade: 'Grade B', serviceType: 'PPS' },
    { id: 'pb004', name: 'Dr. Sukhjit Anand', designation: 'SMO', department: 'Health', sector: 'Health & Medical', salary: 90000, joiningDate: '2013-10-01', pan: 'GOVPB004D', district: 'Jalandhar', grade: 'Grade A', serviceType: 'PB Health' },
    { id: 'pb005', name: 'Balwinder Kaur', designation: 'Master Teacher', department: 'School Education', sector: 'Education', salary: 44000, joiningDate: '2015-07-01', pan: 'GOVPB005E', district: 'Patiala', grade: 'Grade C', serviceType: 'PPSC' },
  ],

  'andhra-pradesh': [
    { id: 'ap001', name: 'Srinivasa Rao', designation: 'IAS Collector', department: 'Collectorate', sector: 'IAS / Administrative', salary: 132000, joiningDate: '2014-07-01', pan: 'GOVAP001A', district: 'Visakhapatnam', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'ap002', name: 'Padmavathi Devi', designation: 'Revenue Divisional Officer', department: 'Revenue', sector: 'Revenue', salary: 62000, joiningDate: '2017-06-01', pan: 'GOVAP002B', district: 'Vijayawada', grade: 'Grade B', serviceType: 'APPSC' },
    { id: 'ap003', name: 'Narayana Reddy', designation: 'CI', department: 'AP Police', sector: 'Police / IPS', salary: 60000, joiningDate: '2016-09-01', pan: 'GOVAP003C', district: 'Guntur', grade: 'Grade B', serviceType: 'APPS' },
    { id: 'ap004', name: 'Dr. Jyothi Lakshmi', designation: 'Govt Doctor', department: 'Health', sector: 'Health & Medical', salary: 88000, joiningDate: '2015-02-01', pan: 'GOVAP004D', district: 'Tirupati', grade: 'Grade A', serviceType: 'AP Health' },
    { id: 'ap005', name: 'Suresh Babu', designation: 'School Assistant', department: 'School Education', sector: 'Education', salary: 36000, joiningDate: '2019-07-01', pan: 'GOVAP005E', district: 'Kurnool', grade: 'Grade C', serviceType: 'APPSC' },
  ],

  'madhya-pradesh': [
    { id: 'mp001', name: 'Ajay Kumar Shrivastava', designation: 'IAS Collector', department: 'Collectorate', sector: 'IAS / Administrative', salary: 130000, joiningDate: '2015-07-01', pan: 'GOVMP001A', district: 'Bhopal', grade: 'Grade A', serviceType: 'IAS' },
    { id: 'mp002', name: 'Shashi Tiwari', designation: 'SDM', department: 'Sub-Division', sector: 'IAS / Administrative', salary: 64000, joiningDate: '2018-10-01', pan: 'GOVMP002B', district: 'Indore', grade: 'Grade B', serviceType: 'MPSC' },
    { id: 'mp003', name: 'Dinesh Chouhan', designation: 'DSP', department: 'MP Police', sector: 'Police / IPS', salary: 72000, joiningDate: '2016-07-01', pan: 'GOVMP003C', district: 'Jabalpur', grade: 'Grade B', serviceType: 'MPPS' },
    { id: 'mp004', name: 'Dr. Anita Bairagi', designation: 'MO', department: 'Health', sector: 'Health & Medical', salary: 84000, joiningDate: '2014-03-01', pan: 'GOVMP004D', district: 'Gwalior', grade: 'Grade A', serviceType: 'MP Health' },
    { id: 'mp005', name: 'Rajesh Malviya', designation: 'Teacher Grade-2', department: 'School Education', sector: 'Education', salary: 34000, joiningDate: '2020-09-01', pan: 'GOVMP005E', district: 'Ujjain', grade: 'Grade C', serviceType: 'MPSC' },
    { id: 'mp006', name: 'Kavita Patel', designation: 'Agriculture Inspector', department: 'Agriculture', sector: 'Agriculture', salary: 38000, joiningDate: '2017-06-15', pan: 'GOVMP006F', district: 'Sagar', grade: 'Grade C', serviceType: 'MP Agri' },
  ],
};

export const govLoginCredentials = {
  username: 'gov_admin',
  password: 'India@2024',
};
