interface Features {
  name: string
  description: string
  isPro: boolean
  isActive: boolean
}

export const features: Array<Features> = [
  {
    name: 'onboarding',
    description: 'Onboarding service when the selection is empty',
    isActive: true,
    isPro: false
  },
  {
    name: 'highlight',
    description: 'Release note that highlights the key feature',
    isActive: true,
    isPro: false
  },
  {
    name: 'create palette',
    description: 'Palette creation service when several colors are selected',
    isActive: true,
    isPro: false
  },
  {
    name: 'edit palette',
    description: 'Palette configuration service when the palette is selected',
    isActive: true,
    isPro: false
  },
  {
    name: 'shortcuts',
    description: 'Quick links and accesses',
    isActive: true,
    isPro: false
  },
  {
    name: 'properties',
    description: 'Shades information and WCAG scores',
    isActive: true,
    isPro: false
  },
  {
    name: 'go create palette',
    description: 'Generate a palette',
    isActive: true,
    isPro: false
  },
  {
    name: 'create local styles',
    description: 'Create local styles on the document',
    isActive: true,
    isPro: false
  },
  {
    name: 'update local styles',
    description: 'Update local styles on the document',
    isActive: true,
    isPro: false
  },
  {
    name: 'presets',
    description: 'List of existing color systems',
    isActive: true,
    isPro: false
  },
  {
    name: 'edit palette name',
    description: 'Palette name text field',
    isActive: true,
    isPro: false
  },
  {
    name: 'enable new algorithm',
    description: 'Toggle for enabling or disabling the color shades generation new algorithm',
    isActive: true,
    isPro: false
  }
]
