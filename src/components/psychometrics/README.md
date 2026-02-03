# Psychometrics Components (Partial Closed-Source)

This directory contains psychometric assessment components used in the research application.

## Components Overview

### 📊 Big5Test.tsx
**Status**: ✅ Open Source

Implements the Big Five personality assessment (OCEAN model):
- **O**penness to Experience
- **C**onscientiousness
- **E**xtraversion
- **A**greeableness
- **N**euroticism

This component uses standardized personality assessment items and is fully included in the public repository.

### 📋 DemographicsForm.tsx
**Status**: ✅ Open Source

Collects participant demographic information for research purposes, including:
- Age, gender, education level
- Professional background
- Other relevant demographic variables

Fully open source and customizable for your research needs.

### 🧩 IQTest.tsx
**Status**: 🔒 **Closed-Source (Proprietary)**

> [!WARNING]
> **This file contains proprietary cognitive test implementation and is NOT included in the public repository.**

#### About This Component

The IQ test implementation is based on the **ICAR (International Cognitive Ability Resource) project** and includes:
- Test question definitions with **correct answers** (scoring logic)
- Validated spatial reasoning assessment items
- Proprietary scoring algorithms
- Copyrighted test stimuli references

Because this component contains the answer key and scoring logic for a validated psychometric instrument, it is kept closed-source to:
1. **Maintain test validity** - Prevent test-taker exposure to answers
2. **Respect copyright** - Honor ICAR project intellectual property
3. **Ensure research integrity** - Protect the assessment from compromise

#### Obtaining Access

To use the IQ test component in your instance of this application:

1. **Get ICAR Materials**: Visit **[https://icar-project.com/](https://icar-project.com/)** to request access to the cognitive test items

2. **Request Source Code**: If you have legitimate research/academic use for this component:
   - Contact the repository maintainer
   - Provide evidence of ICAR licensing/permission
   - Demonstrate appropriate research ethics approval

3. **Implement Your Own**: Alternatively, create your own cognitive assessment:
   - Use different validated cognitive tests
   - Implement your own test logic in a compatible format
   - Follow the same component interface for seamless integration

## For Developers: Implementing Custom Cognitive Tests

### Component Interface

The `IQTest` component follows this interface:

```typescript
interface IQTestProps {
  onComplete: () => void;
}

type Question = {
  id: string;
  imageSrc: string;
  correctAnswer: string;
  options: string[];
};
```

### Implementation Steps

To create your own cognitive test:

1. **Create test assets**: Add your test images to `public/CognitiveAssets/`

2. **Define questions**: Update the `rawQuestions` array with your test items:
   ```typescript
   const rawQuestions: Question[] = [
     { 
       id: "YOUR_TEST_ID_1", 
       imageSrc: "/CognitiveAssets/your_image_1.png", 
       correctAnswer: "A", 
       options: ["A", "B", "C", "D"] 
     },
     // ... more questions
   ];
   ```

3. **Configure scoring**: Modify the `submit()` function if you need custom scoring logic

4. **Adjust timing**: Update `TIME_LIMIT_SECONDS` constant for your test duration

5. **Update UI text**: Modify labels and instructions to match your test type

### Testing Considerations

When implementing cognitive assessments:

- ✅ Ensure test validity through proper psychometric validation
- ✅ Maintain test security (don't expose answers in client code)
- ✅ Consider time limits appropriate for your test type
- ✅ Implement proper randomization of question order
- ✅ Follow ethical guidelines for psychological testing
- ✅ Obtain necessary permissions/licensing for test materials

## Data Storage

All psychometric data is stored in Firestore under the participant's user document:

```typescript
{
  participants/{userId}: {
    demographics: { ... },
    big5: { ... },
    iq: {
      answers: {},
      questionOrder: [],
      completedAt: timestamp,
      timeRemaining: number,
      score: number
    }
  }
}
```

See `src/config.ts` for collection names and configuration.

## Questions?

- **ICAR test access** → https://icar-project.com/
- **Application configuration** → See main project README
- **Psychometric implementation** → Review individual component source code

---

*The framework for psychometric testing is open source, but specific test implementations may be proprietary depending on intellectual property and validation requirements.*
