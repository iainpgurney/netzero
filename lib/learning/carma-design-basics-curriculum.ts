import type { CurriculumBundle } from './carma-design-basics-curriculum.types'
import { carmaDesignBasicsM01 } from './carma-design-basics-modules/m01'
import { carmaDesignBasicsM02 } from './carma-design-basics-modules/m02'
import { carmaDesignBasicsM03 } from './carma-design-basics-modules/m03'
import { carmaDesignBasicsM04 } from './carma-design-basics-modules/m04'
import { carmaDesignBasicsM05 } from './carma-design-basics-modules/m05'
import { carmaDesignBasicsM06 } from './carma-design-basics-modules/m06'
import { carmaDesignBasicsM07 } from './carma-design-basics-modules/m07'
import { carmaDesignBasicsM08 } from './carma-design-basics-modules/m08'

export const carmaDesignBasicsCurriculum: CurriculumBundle = {
  course: {
    slug: 'carma-design-basics',
    title: 'Carma Design Basics',
    description:
      'A practical foundations course for marketers at Carma who need to produce social posts, slide decks, short-form video, and product imagery without a design background. Pairs Canva (the execution tool) with Claude (the thinking partner) so you can plan, brief, and ship work that looks intentional. By the end you will have a working Canva brand kit, a starter template library, and a repeatable workflow for turning a rough idea into a polished asset.',
    icon: '🎨',
    isActive: true,
  },
  modules: [
    carmaDesignBasicsM01,
    carmaDesignBasicsM02,
    carmaDesignBasicsM03,
    carmaDesignBasicsM04,
    carmaDesignBasicsM05,
    carmaDesignBasicsM06,
    carmaDesignBasicsM07,
    carmaDesignBasicsM08,
  ],
}
