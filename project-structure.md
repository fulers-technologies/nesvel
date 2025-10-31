# Project Structure - Clean Architecture

## 1. Cameras Module

```bash
src/cameras/
├── CamerasModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetCamerasPayload.ts
│   │   └── GetCamerasResponse.ts
│   └── useCases/
│       ├── FindCameraUseCase.ts
│       ├── GetCamerasUseCase.ts
│       ├── CreateCameraUseCase.ts
│       ├── UpdateCameraUseCase.ts
│       └── DeleteCameraUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── CameraEntity.ts
│   └── specifications/
│       └── ICameraRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── CameraRepository.ts
│   └── models/
│       ├── GetCamerasQuery.ts
│       └── CameraDto.ts
│
└── presentation/
    ├── components/
    │   ├── CameraItem.tsx
    │   ├── CameraForm.tsx
    │   └── CameraList.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── CameraPage.tsx
    │   └── CamerasPage.tsx
    ├── stores/
    │   ├── FindCameraStore/
    │   │   ├── FindCameraStore.ts
    │   │   ├── FindCameraStoreContext.ts
    │   │   ├── FindCameraStoreProvider.tsx
    │   │   └── useFindCameraStore.ts
    │   └── GetCamerasStore/
    │       ├── GetCamerasStore.ts
    │       ├── GetCamerasStoreContext.ts
    │       ├── GetCamerasStoreProvider.tsx
    │       └── useGetCamerasStore.ts
    └── types/
        ├── FindCameraStoreState.ts
        └── GetCamerasStoreState.ts
```

## 2. Detections Module

```bash
src/detections/
├── DetectionsModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetDetectionsPayload.ts
│   │   └── GetDetectionsResponse.ts
│   └── useCases/
│       ├── FindDetectionUseCase.ts
│       ├── GetDetectionsUseCase.ts
│       ├── CreateDetectionUseCase.ts
│       └── AnalyzeDetectionUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── DetectionEntity.ts
│   └── specifications/
│       └── IDetectionRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── DetectionRepository.ts
│   └── models/
│       ├── GetDetectionsQuery.ts
│       └── DetectionDto.ts
│
└── presentation/
    ├── components/
    │   ├── DetectionItem.tsx
    │   ├── DetectionDetails.tsx
    │   └── DetectionList.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── DetectionPage.tsx
    │   └── DetectionsPage.tsx
    ├── stores/
    │   ├── FindDetectionStore/
    │   │   ├── FindDetectionStore.ts
    │   │   ├── FindDetectionStoreContext.ts
    │   │   ├── FindDetectionStoreProvider.tsx
    │   │   └── useFindDetectionStore.ts
    │   └── GetDetectionsStore/
    │       ├── GetDetectionsStore.ts
    │       ├── GetDetectionsStoreContext.ts
    │       ├── GetDetectionsStoreProvider.tsx
    │       └── useGetDetectionsStore.ts
    └── types/
        ├── FindDetectionStoreState.ts
        └── GetDetectionsStoreState.ts
```

## 3. Alerts Module

```bash
src/alerts/
├── AlertsModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetAlertsPayload.ts
│   │   └── GetAlertsResponse.ts
│   └── useCases/
│       ├── FindAlertUseCase.ts
│       ├── GetAlertsUseCase.ts
│       ├── CreateAlertUseCase.ts
│       ├── AcknowledgeAlertUseCase.ts
│       └── ResolveAlertUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── AlertEntity.ts
│   └── specifications/
│       └── IAlertRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── AlertRepository.ts
│   └── models/
│       ├── GetAlertsQuery.ts
│       └── AlertDto.ts
│
└── presentation/
    ├── components/
    │   ├── AlertItem.tsx
    │   ├── AlertBadge.tsx
    │   └── AlertList.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── AlertPage.tsx
    │   └── AlertsPage.tsx
    ├── stores/
    │   ├── FindAlertStore/
    │   │   ├── FindAlertStore.ts
    │   │   ├── FindAlertStoreContext.ts
    │   │   ├── FindAlertStoreProvider.tsx
    │   │   └── useFindAlertStore.ts
    │   └── GetAlertsStore/
    │       ├── GetAlertsStore.ts
    │       ├── GetAlertsStoreContext.ts
    │       ├── GetAlertsStoreProvider.tsx
    │       └── useGetAlertsStore.ts
    └── types/
        ├── FindAlertStoreState.ts
        └── GetAlertsStoreState.ts
```

## 4. Metrics Module

```bash
src/metrics/
├── MetricsModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetMetricsPayload.ts
│   │   └── GetMetricsResponse.ts
│   └── useCases/
│       ├── GetMetricsUseCase.ts
│       ├── GetMetricByIdUseCase.ts
│       ├── CalculateMetricsUseCase.ts
│       └── ExportMetricsUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── MetricEntity.ts
│   └── specifications/
│       └── IMetricRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── MetricRepository.ts
│   └── models/
│       ├── GetMetricsQuery.ts
│       └── MetricDto.ts
│
└── presentation/
    ├── components/
    │   ├── MetricCard.tsx
    │   ├── MetricChart.tsx
    │   └── MetricsDashboard.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── MetricPage.tsx
    │   └── MetricsPage.tsx
    ├── stores/
    │   ├── GetMetricStore/
    │   │   ├── GetMetricStore.ts
    │   │   ├── GetMetricStoreContext.ts
    │   │   ├── GetMetricStoreProvider.tsx
    │   │   └── useGetMetricStore.ts
    │   └── GetMetricsStore/
    │       ├── GetMetricsStore.ts
    │       ├── GetMetricsStoreContext.ts
    │       ├── GetMetricsStoreProvider.tsx
    │       └── useGetMetricsStore.ts
    └── types/
        ├── GetMetricStoreState.ts
        └── GetMetricsStoreState.ts
```

## 5. Reports Module

```bash
src/reports/
├── ReportsModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetReportsPayload.ts
│   │   └── GetReportsResponse.ts
│   └── useCases/
│       ├── FindReportUseCase.ts
│       ├── GetReportsUseCase.ts
│       ├── GenerateReportUseCase.ts
│       ├── ExportReportUseCase.ts
│       └── ScheduleReportUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── ReportEntity.ts
│   └── specifications/
│       └── IReportRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── ReportRepository.ts
│   └── models/
│       ├── GetReportsQuery.ts
│       └── ReportDto.ts
│
└── presentation/
    ├── components/
    │   ├── ReportItem.tsx
    │   ├── ReportForm.tsx
    │   └── ReportViewer.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── ReportPage.tsx
    │   └── ReportsPage.tsx
    ├── stores/
    │   ├── FindReportStore/
    │   │   ├── FindReportStore.ts
    │   │   ├── FindReportStoreContext.ts
    │   │   ├── FindReportStoreProvider.tsx
    │   │   └── useFindReportStore.ts
    │   └── GetReportsStore/
    │       ├── GetReportsStore.ts
    │       ├── GetReportsStoreContext.ts
    │       ├── GetReportsStoreProvider.tsx
    │       └── useGetReportsStore.ts
    └── types/
        ├── FindReportStoreState.ts
        └── GetReportsStoreState.ts
```

## 6. Models Module

```bash
src/models/
├── ModelsModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetModelsPayload.ts
│   │   └── GetModelsResponse.ts
│   └── useCases/
│       ├── FindModelUseCase.ts
│       ├── GetModelsUseCase.ts
│       ├── TrainModelUseCase.ts
│       ├── DeployModelUseCase.ts
│       └── ValidateModelUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── ModelEntity.ts
│   └── specifications/
│       └── IModelRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── ModelRepository.ts
│   └── models/
│       ├── GetModelsQuery.ts
│       └── ModelDto.ts
│
└── presentation/
    ├── components/
    │   ├── ModelItem.tsx
    │   ├── ModelCard.tsx
    │   └── ModelList.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── ModelPage.tsx
    │   └── ModelsPage.tsx
    ├── stores/
    │   ├── FindModelStore/
    │   │   ├── FindModelStore.ts
    │   │   ├── FindModelStoreContext.ts
    │   │   ├── FindModelStoreProvider.tsx
    │   │   └── useFindModelStore.ts
    │   └── GetModelsStore/
    │       ├── GetModelsStore.ts
    │       ├── GetModelsStoreContext.ts
    │       ├── GetModelsStoreProvider.tsx
    │       └── useGetModelsStore.ts
    └── types/
        ├── FindModelStoreState.ts
        └── GetModelsStoreState.ts
```

## 7. Rules Module

```bash
src/rules/
├── RulesModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetRulesPayload.ts
│   │   └── GetRulesResponse.ts
│   └── useCases/
│       ├── FindRuleUseCase.ts
│       ├── GetRulesUseCase.ts
│       ├── CreateRuleUseCase.ts
│       ├── UpdateRuleUseCase.ts
│       ├── DeleteRuleUseCase.ts
│       └── ValidateRuleUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── RuleEntity.ts
│   └── specifications/
│       └── IRuleRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── RuleRepository.ts
│   └── models/
│       ├── GetRulesQuery.ts
│       └── RuleDto.ts
│
└── presentation/
    ├── components/
    │   ├── RuleItem.tsx
    │   ├── RuleForm.tsx
    │   └── RuleBuilder.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── RulePage.tsx
    │   └── RulesPage.tsx
    ├── stores/
    │   ├── FindRuleStore/
    │   │   ├── FindRuleStore.ts
    │   │   ├── FindRuleStoreContext.ts
    │   │   ├── FindRuleStoreProvider.tsx
    │   │   └── useFindRuleStore.ts
    │   └── GetRulesStore/
    │       ├── GetRulesStore.ts
    │       ├── GetRulesStoreContext.ts
    │       ├── GetRulesStoreProvider.tsx
    │       └── useGetRulesStore.ts
    └── types/
        ├── FindRuleStoreState.ts
        └── GetRulesStoreState.ts
```

## 8. Employees Module

```bash
src/employees/
├── EmployeesModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetEmployeesPayload.ts
│   │   └── GetEmployeesResponse.ts
│   └── useCases/
│       ├── FindEmployeeUseCase.ts
│       ├── GetEmployeesUseCase.ts
│       ├── CreateEmployeeUseCase.ts
│       ├── UpdateEmployeeUseCase.ts
│       └── DeleteEmployeeUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── EmployeeEntity.ts
│   └── specifications/
│       └── IEmployeeRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── EmployeeRepository.ts
│   └── models/
│       ├── GetEmployeesQuery.ts
│       └── EmployeeDto.ts
│
└── presentation/
    ├── components/
    │   ├── EmployeeItem.tsx
    │   ├── EmployeeForm.tsx
    │   └── EmployeeCard.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── EmployeePage.tsx
    │   └── EmployeesPage.tsx
    ├── stores/
    │   ├── FindEmployeeStore/
    │   │   ├── FindEmployeeStore.ts
    │   │   ├── FindEmployeeStoreContext.ts
    │   │   ├── FindEmployeeStoreProvider.tsx
    │   │   └── useFindEmployeeStore.ts
    │   └── GetEmployeesStore/
    │       ├── GetEmployeesStore.ts
    │       ├── GetEmployeesStoreContext.ts
    │       ├── GetEmployeesStoreProvider.tsx
    │       └── useGetEmployeesStore.ts
    └── types/
        ├── FindEmployeeStoreState.ts
        └── GetEmployeesStoreState.ts
```

## 9. Settings Module

```bash
src/settings/
├── SettingsModule.ts
│
├── application/
│   ├── types/
│   │   ├── GetSettingsPayload.ts
│   │   └── GetSettingsResponse.ts
│   └── useCases/
│       ├── GetSettingsUseCase.ts
│       ├── UpdateSettingsUseCase.ts
│       ├── ResetSettingsUseCase.ts
│       └── ExportSettingsUseCase.ts
│
├── domain/
│   ├── entities/
│   │   └── SettingEntity.ts
│   └── specifications/
│       └── ISettingRepository.ts
│
├── infrastructure/
│   ├── implementations/
│   │   └── SettingRepository.ts
│   └── models/
│       ├── GetSettingsQuery.ts
│       └── SettingDto.ts
│
└── presentation/
    ├── components/
    │   ├── SettingItem.tsx
    │   ├── SettingForm.tsx
    │   └── SettingsPanel.tsx
    ├── i18n/
    │   └── en.ts
    ├── pages/
    │   ├── SettingPage.tsx
    │   └── SettingsPage.tsx
    ├── stores/
    │   ├── GetSettingStore/
    │   │   ├── GetSettingStore.ts
    │   │   ├── GetSettingStoreContext.ts
    │   │   ├── GetSettingStoreProvider.tsx
    │   │   └── useGetSettingStore.ts
    │   └── GetSettingsStore/
    │       ├── GetSettingsStore.ts
    │       ├── GetSettingsStoreContext.ts
    │       ├── GetSettingsStoreProvider.tsx
    │       └── useGetSettingsStore.ts
    └── types/
        ├── GetSettingStoreState.ts
        └── GetSettingsStoreState.ts
```

## Overview

Each module follows the **Clean Architecture** pattern with four layers:

### 1. **Domain Layer** (`domain/`)

- **entities/**: Core business entities
- **specifications/**: Interfaces for repositories (dependency inversion)

### 2. **Application Layer** (`application/`)

- **types/**: DTOs for payloads and responses
- **useCases/**: Business logic implementations

### 3. **Infrastructure Layer** (`infrastructure/`)

- **implementations/**: Concrete implementations of repositories
- **models/**: Data transfer objects and queries

### 4. **Presentation Layer** (`presentation/`)

- **components/**: React UI components
- **i18n/**: Internationalization files
- **pages/**: Page-level components
- **stores/**: MobX state management stores
- **types/**: TypeScript types for UI state

### Module Entry Point

Each module has a `{Module}Module.ts` file for dependency injection configuration.
