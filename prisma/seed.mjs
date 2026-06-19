import { PrismaClient } from '@prisma/client'
import { states, unionTerritories } from '../data/states.js'
import { districtsByState } from '../data/districts.js'
import { govSectors, sectorIcons, sectorColors, govEmployees } from '../data/govData.js'
import { privateOrgs } from '../data/privateOrgs.js'
import { centralSchemes, stateSchemes } from '../data/schemes.js'
import { centralExams, stateExams } from '../data/exams.js'
import { centralScholarships, stateScholarships } from '../data/scholarships.js'
import { centralTenders, stateTenders } from '../data/tenders.js'
import { GOV_ADMINS } from '../data/govAdmins.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── States ─────────────────────────────────────────────────
  console.log('Seeding states...')
  for (const s of states) {
    await prisma.state.upsert({
      where: { id: s.id },
      update: { name: s.name, capital: s.capital, region: s.region, color: s.color, emoji: s.emoji, schemes: s.schemes, type: 'state' },
      create: { id: s.id, name: s.name, capital: s.capital, region: s.region, color: s.color, emoji: s.emoji, schemes: s.schemes, type: 'state' },
    })
  }

  // ── Union Territories ──────────────────────────────────────
  console.log('Seeding union territories...')
  for (const ut of unionTerritories) {
    await prisma.state.upsert({
      where: { id: ut.id },
      update: { name: ut.name, capital: ut.capital, region: ut.region, color: ut.color, emoji: ut.emoji, schemes: ut.schemes, type: 'union_territory' },
      create: { id: ut.id, name: ut.name, capital: ut.capital, region: ut.region, color: ut.color, emoji: ut.emoji, schemes: ut.schemes, type: 'union_territory' },
    })
  }
  console.log(`  Done: ${states.length} states, ${unionTerritories.length} UTs`)

  // ── Districts ──────────────────────────────────────────────
  console.log('Seeding districts...')
  let districtCount = 0
  for (const [stateId, districtNames] of Object.entries(districtsByState)) {
    for (const name of districtNames) {
      // Use stable ID: stateId + slugified name
      const id = `${stateId}__${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      await prisma.district.upsert({
        where: { id },
        update: { stateId, name },
        create: { id, stateId, name },
      })
      districtCount++
    }
  }
  console.log(`  Done: ${districtCount} districts`)

  // ── GovSectors ─────────────────────────────────────────────
  console.log('Seeding gov sectors...')
  for (const name of govSectors) {
    await prisma.govSector.upsert({
      where: { name },
      update: { icon: sectorIcons[name] || null, color: sectorColors[name] || null },
      create: { name, icon: sectorIcons[name] || null, color: sectorColors[name] || null },
    })
  }
  console.log(`  Done: ${govSectors.length} sectors`)

  // ── GovEmployees ───────────────────────────────────────────
  console.log('Seeding gov employees...')
  let empCount = 0
  for (const [stateId, emps] of Object.entries(govEmployees)) {
    for (const emp of emps) {
      await prisma.govEmployee.upsert({
        where: { id: emp.id },
        update: {
          stateId,
          name: emp.name,
          designation: emp.designation || null,
          department: emp.department || null,
          sector: emp.sector || null,
          salary: emp.salary || null,
          joiningDate: emp.joiningDate || null,
          pan: emp.pan || null,
          district: emp.district || null,
          grade: emp.grade || null,
          serviceType: emp.serviceType || null,
        },
        create: {
          id: emp.id,
          stateId,
          name: emp.name,
          designation: emp.designation || null,
          department: emp.department || null,
          sector: emp.sector || null,
          salary: emp.salary || null,
          joiningDate: emp.joiningDate || null,
          pan: emp.pan || null,
          district: emp.district || null,
          grade: emp.grade || null,
          serviceType: emp.serviceType || null,
        },
      })
      empCount++
    }
  }
  console.log(`  Done: ${empCount} employees`)

  // ── PrivateOrgs ────────────────────────────────────────────
  console.log('Seeding private orgs...')
  for (const org of privateOrgs) {
    await prisma.privateOrg.upsert({
      where: { id: org.id },
      update: {
        name: org.name,
        shortName: org.shortName || null,
        gst: org.gst || null,
        sector: org.sector || null,
        stateId: org.stateId || null,
        stateName: org.stateName || null,
        district: org.district || null,
        city: org.city || null,
        employees: org.employees || null,
        founded: org.founded || null,
        icon: org.icon || null,
        color: org.color || null,
        adminPassword: org.adminPassword || null,
        description: org.description || null,
      },
      create: {
        id: org.id,
        name: org.name,
        shortName: org.shortName || null,
        gst: org.gst || null,
        sector: org.sector || null,
        stateId: org.stateId || null,
        stateName: org.stateName || null,
        district: org.district || null,
        city: org.city || null,
        employees: org.employees || null,
        founded: org.founded || null,
        icon: org.icon || null,
        color: org.color || null,
        adminPassword: org.adminPassword || null,
        description: org.description || null,
      },
    })
  }
  console.log(`  Done: ${privateOrgs.length} orgs`)

  // ── Central Schemes ────────────────────────────────────────
  console.log('Seeding central schemes...')
  for (const s of centralSchemes) {
    await prisma.scheme.upsert({
      where: { id: s.id },
      update: {
        scope: 'central',
        stateId: null,
        name: s.name,
        nameLocal: s.nameHindi || null,
        ministry: s.ministry || null,
        category: s.category || null,
        benefit: s.benefit || null,
        eligibility: s.eligibility || null,
        icon: s.icon || null,
        color: s.color || null,
        badgeColor: s.badgeColor || null,
        description: s.description || null,
        documents: s.documents || [],
        formFields: s.formFields || [],
        hasPanLogic: s.hasPanLogic || false,
        extra: null,
      },
      create: {
        id: s.id,
        scope: 'central',
        stateId: null,
        name: s.name,
        nameLocal: s.nameHindi || null,
        ministry: s.ministry || null,
        category: s.category || null,
        benefit: s.benefit || null,
        eligibility: s.eligibility || null,
        icon: s.icon || null,
        color: s.color || null,
        badgeColor: s.badgeColor || null,
        description: s.description || null,
        documents: s.documents || [],
        formFields: s.formFields || [],
        hasPanLogic: s.hasPanLogic || false,
        extra: null,
      },
    })
  }
  console.log(`  Done: ${centralSchemes.length} central schemes`)

  // ── State Schemes ──────────────────────────────────────────
  console.log('Seeding state schemes...')
  let stateSchemeCount = 0
  for (const [stateId, schemes] of Object.entries(stateSchemes)) {
    for (const s of schemes) {
      const extra = {}
      if (s.nameBengali) extra.nameBengali = s.nameBengali
      if (s.nameAlso) extra.nameAlso = s.nameAlso
      if (s.panLogicNote) extra.panLogicNote = s.panLogicNote
      if (s.launchedOn) extra.launchedOn = s.launchedOn

      await prisma.scheme.upsert({
        where: { id: s.id },
        update: {
          scope: 'state',
          stateId,
          name: s.name,
          nameLocal: s.nameHindi || s.nameBengali || null,
          ministry: s.ministry || null,
          category: s.category || null,
          benefit: s.benefit || null,
          eligibility: s.eligibility || null,
          icon: s.icon || null,
          color: s.color || null,
          badgeColor: s.badgeColor || null,
          description: s.description || null,
          documents: s.documents || [],
          formFields: s.formFields || [],
          hasPanLogic: s.hasPanLogic || false,
          extra: Object.keys(extra).length > 0 ? extra : null,
        },
        create: {
          id: s.id,
          scope: 'state',
          stateId,
          name: s.name,
          nameLocal: s.nameHindi || s.nameBengali || null,
          ministry: s.ministry || null,
          category: s.category || null,
          benefit: s.benefit || null,
          eligibility: s.eligibility || null,
          icon: s.icon || null,
          color: s.color || null,
          badgeColor: s.badgeColor || null,
          description: s.description || null,
          documents: s.documents || [],
          formFields: s.formFields || [],
          hasPanLogic: s.hasPanLogic || false,
          extra: Object.keys(extra).length > 0 ? extra : null,
        },
      })
      stateSchemeCount++
    }
  }
  console.log(`  Done: ${stateSchemeCount} state schemes`)

  // ── Central Exams ──────────────────────────────────────────
  console.log('Seeding central exams...')
  for (const e of centralExams) {
    await prisma.exam.upsert({
      where: { id: e.id },
      update: {
        scope: 'central',
        stateId: null,
        name: e.name,
        shortName: e.shortName || null,
        conductedBy: e.conductedBy || null,
        category: e.category || null,
        posts: e.posts || null,
        applicationFee: e.applicationFee || null,
        eligibility: e.eligibility || null,
        nextExam: e.nextExam || null,
        applicationDeadline: e.applicationDeadline || null,
        icon: e.icon || null,
        color: e.color || null,
        badgeColor: e.badgeColor || null,
        status: e.status || null,
        description: e.description || null,
        formFields: e.formFields || [],
      },
      create: {
        id: e.id,
        scope: 'central',
        stateId: null,
        name: e.name,
        shortName: e.shortName || null,
        conductedBy: e.conductedBy || null,
        category: e.category || null,
        posts: e.posts || null,
        applicationFee: e.applicationFee || null,
        eligibility: e.eligibility || null,
        nextExam: e.nextExam || null,
        applicationDeadline: e.applicationDeadline || null,
        icon: e.icon || null,
        color: e.color || null,
        badgeColor: e.badgeColor || null,
        status: e.status || null,
        description: e.description || null,
        formFields: e.formFields || [],
      },
    })
  }
  console.log(`  Done: ${centralExams.length} central exams`)

  // ── State Exams ────────────────────────────────────────────
  console.log('Seeding state exams...')
  let stateExamCount = 0
  for (const [stateId, exams] of Object.entries(stateExams)) {
    for (const e of exams) {
      await prisma.exam.upsert({
        where: { id: e.id },
        update: {
          scope: 'state',
          stateId,
          name: e.name,
          shortName: e.shortName || null,
          conductedBy: e.conductedBy || null,
          category: e.category || null,
          posts: e.posts || null,
          applicationFee: e.applicationFee || null,
          eligibility: e.eligibility || null,
          nextExam: e.nextExam || null,
          applicationDeadline: e.applicationDeadline || null,
          icon: e.icon || null,
          color: e.color || null,
          badgeColor: e.badgeColor || null,
          status: e.status || null,
          description: e.description || null,
          formFields: e.formFields || [],
        },
        create: {
          id: e.id,
          scope: 'state',
          stateId,
          name: e.name,
          shortName: e.shortName || null,
          conductedBy: e.conductedBy || null,
          category: e.category || null,
          posts: e.posts || null,
          applicationFee: e.applicationFee || null,
          eligibility: e.eligibility || null,
          nextExam: e.nextExam || null,
          applicationDeadline: e.applicationDeadline || null,
          icon: e.icon || null,
          color: e.color || null,
          badgeColor: e.badgeColor || null,
          status: e.status || null,
          description: e.description || null,
          formFields: e.formFields || [],
        },
      })
      stateExamCount++
    }
  }
  console.log(`  Done: ${stateExamCount} state exams`)

  // ── Central Scholarships ───────────────────────────────────
  console.log('Seeding central scholarships...')
  for (const s of centralScholarships) {
    await prisma.scholarship.upsert({
      where: { id: s.id },
      update: {
        scope: 'central',
        stateId: null,
        name: s.name,
        nameLocal: s.nameHindi || null,
        ministry: s.ministry || null,
        category: s.category || null,
        subcategory: s.subcategory || null,
        benefit: s.benefit || null,
        eligibility: s.eligibility || null,
        icon: s.icon || null,
        color: s.color || null,
        badgeColor: s.badgeColor || null,
        description: s.description || null,
        documents: s.documents || [],
        formFields: s.formFields || [],
      },
      create: {
        id: s.id,
        scope: 'central',
        stateId: null,
        name: s.name,
        nameLocal: s.nameHindi || null,
        ministry: s.ministry || null,
        category: s.category || null,
        subcategory: s.subcategory || null,
        benefit: s.benefit || null,
        eligibility: s.eligibility || null,
        icon: s.icon || null,
        color: s.color || null,
        badgeColor: s.badgeColor || null,
        description: s.description || null,
        documents: s.documents || [],
        formFields: s.formFields || [],
      },
    })
  }
  console.log(`  Done: ${centralScholarships.length} central scholarships`)

  // ── State Scholarships ─────────────────────────────────────
  console.log('Seeding state scholarships...')
  let stateScholarshipCount = 0
  for (const [stateId, schols] of Object.entries(stateScholarships)) {
    for (const s of schols) {
      await prisma.scholarship.upsert({
        where: { id: s.id },
        update: {
          scope: 'state',
          stateId,
          name: s.name,
          nameLocal: s.nameBengali || s.nameHindi || null,
          ministry: s.ministry || null,
          category: s.category || null,
          subcategory: s.subcategory || null,
          benefit: s.benefit || null,
          eligibility: s.eligibility || null,
          icon: s.icon || null,
          color: s.color || null,
          badgeColor: s.badgeColor || null,
          description: s.description || null,
          documents: s.documents || [],
          formFields: s.formFields || [],
        },
        create: {
          id: s.id,
          scope: 'state',
          stateId,
          name: s.name,
          nameLocal: s.nameBengali || s.nameHindi || null,
          ministry: s.ministry || null,
          category: s.category || null,
          subcategory: s.subcategory || null,
          benefit: s.benefit || null,
          eligibility: s.eligibility || null,
          icon: s.icon || null,
          color: s.color || null,
          badgeColor: s.badgeColor || null,
          description: s.description || null,
          documents: s.documents || [],
          formFields: s.formFields || [],
        },
      })
      stateScholarshipCount++
    }
  }
  console.log(`  Done: ${stateScholarshipCount} state scholarships`)

  // ── Central Tenders (stateId = 'central') ─────────────────
  console.log('Seeding central tenders...')
  for (const t of centralTenders) {
    await prisma.tender.upsert({
      where: { id: t.id },
      update: {
        stateId: 'central',
        name: t.name,
        shortName: t.shortName || null,
        department: t.department || null,
        category: t.category || null,
        subcategory: t.subcategory || null,
        estimatedValue: t.estimatedValue || null,
        bidDeadline: t.bidDeadline || null,
        workDescription: t.workDescription || null,
        eligibility: t.eligibility || null,
        icon: t.icon || null,
        status: t.status || null,
        tenderNo: t.tenderNo || null,
        documents: t.documents || [],
        formFields: t.formFields || [],
      },
      create: {
        id: t.id,
        stateId: 'central',
        name: t.name,
        shortName: t.shortName || null,
        department: t.department || null,
        category: t.category || null,
        subcategory: t.subcategory || null,
        estimatedValue: t.estimatedValue || null,
        bidDeadline: t.bidDeadline || null,
        workDescription: t.workDescription || null,
        eligibility: t.eligibility || null,
        icon: t.icon || null,
        status: t.status || null,
        tenderNo: t.tenderNo || null,
        documents: t.documents || [],
        formFields: t.formFields || [],
      },
    })
  }
  console.log(`  Done: ${centralTenders.length} central tenders`)

  // ── State Tenders ──────────────────────────────────────────
  console.log('Seeding state tenders...')
  let stateTenderCount = 0
  for (const [stateId, tenders] of Object.entries(stateTenders)) {
    for (const t of tenders) {
      await prisma.tender.upsert({
        where: { id: t.id },
        update: {
          stateId,
          name: t.name,
          shortName: t.shortName || null,
          department: t.department || null,
          category: t.category || null,
          subcategory: t.subcategory || null,
          estimatedValue: t.estimatedValue || null,
          bidDeadline: t.bidDeadline || null,
          workDescription: t.workDescription || null,
          eligibility: t.eligibility || null,
          icon: t.icon || null,
          status: t.status || null,
          tenderNo: t.tenderNo || null,
          documents: t.documents || [],
          formFields: t.formFields || [],
        },
        create: {
          id: t.id,
          stateId,
          name: t.name,
          shortName: t.shortName || null,
          department: t.department || null,
          category: t.category || null,
          subcategory: t.subcategory || null,
          estimatedValue: t.estimatedValue || null,
          bidDeadline: t.bidDeadline || null,
          workDescription: t.workDescription || null,
          eligibility: t.eligibility || null,
          icon: t.icon || null,
          status: t.status || null,
          tenderNo: t.tenderNo || null,
          documents: t.documents || [],
          formFields: t.formFields || [],
        },
      })
      stateTenderCount++
    }
  }
  console.log(`  Done: ${stateTenderCount} state tenders`)

  // ── GovAdmins ──────────────────────────────────────────────
  console.log('Seeding gov admins...')
  for (const [username, admin] of Object.entries(GOV_ADMINS)) {
    await prisma.govAdmin.upsert({
      where: { username },
      update: {
        password: admin.password,
        stateId: admin.stateId,
        stateName: admin.stateName,
        emoji: admin.emoji || null,
        level: admin.level || 'state',
      },
      create: {
        username,
        password: admin.password,
        stateId: admin.stateId,
        stateName: admin.stateName,
        emoji: admin.emoji || null,
        level: admin.level || 'state',
      },
    })
  }
  console.log(`  Done: ${Object.keys(GOV_ADMINS).length} gov admins`)

  console.log('\nSeed complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
