// components/DownloadSection.tsx

import { useDownloadDesktopApp, useGetLatestRelease } from "../../api_services/download_app_api/downloadAppApi"
import step1  from "../../assets/download_app_instruction_1.png"
// import { useGetLatestRelease } from "../../api_services/download_app_api/downloadAppApi"

export default function DownloadSection() {
    const { data: release, isLoading, isError } = useGetLatestRelease()
    const { mutate: startDownload, isPending: isStarting, isError: isDownloadError, error: downloadError } = useDownloadDesktopApp()


    return (
        <section className="w-full bg-mainBg px-4 py-12 sm:py-16 md:py-20">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8 md:p-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft sm:h-16 sm:w-16">
                            {/* <Monitor className="h-7 w-7 text-primary sm:h-8 sm:w-8" /> */}
                            <i className="fa-solid fa-display h-7 w-7 text-primary sm:h-8 sm:w-8"></i>
                        </div>

                        <h2 className="text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
                            DailyGrades Offline Desktop App
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-muted sm:text-base">
                            Manage your school fully offline — students, fees, attendance, and more, right from your desktop.
                        </p>

                        {isLoading && (
                            <div className="mt-8 h-11 w-48 animate-pulse rounded-lg bg-primary-soft" />
                        )}

                        {isError && (
                            <p className="mt-8 text-sm text-muted">
                                Unable to load the download link right now. Please try again shortly.
                            </p>
                        )}

                        {/* {release && (
                            <>
                                <a
                                    href={release.windowsUrl}
                                    download
                                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-inverse transition-colors hover:bg-primary-hover sm:w-auto sm:text-base"
                                >
                                    <i className="fa-solid fa-download h-4 w-4"></i>

                                    Download for Windows
                                </a>

                                <div className="mt-4 flex flex-col items-center gap-1 text-xs text-muted sm:flex-row sm:gap-4">
                                    <span>Version {release.version}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Released {new Date(release.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </>
                        )} */}

                        {release && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => startDownload()}
                                    disabled={isStarting}
                                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-inverse transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-base"
                                >
                                    <i className="fa-solid fa-download h-4 w-4"></i>
                                    {isStarting ? 'Starting download...' : 'Download for Windows'}
                                </button>

                                {isDownloadError && (
                                    <p className="mt-3 text-sm text-red-500">{downloadError.message}</p>
                                )}

                                <div className="mt-4 flex flex-col items-center gap-1 text-xs text-muted sm:flex-row sm:gap-4">
                                    <span>Version {release.version}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Released {new Date(release.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </>
                        )}

                        <div className="mt-8 flex w-full flex-col gap-2 border-t border-border-soft pt-6 sm:flex-row sm:justify-center sm:gap-6">
                            <div className="flex items-center justify-center gap-2 text-xs text-muted sm:text-sm">
                                {/* <CheckCircle2 className="h-4 w-4 text-success" /> */}
                                <i className="fa-solid fa-circle-check h-4 w-4 text-success"></i>
                                Works fully offline
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted sm:text-sm">
                                {/* <CheckCircle2 className="h-4 w-4 text-success" /> */}
                                <i className="fa-solid fa-circle-check h-4 w-4 text-success"></i>
                                Your data stays on your device
                            </div>
                        </div>
                    </div>
                </div>



                <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                            <i className="fa-solid fa-shield-halved text-primary"></i>
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-semibold text-foreground sm:text-lg">
                                Seeing a security warning? This is expected.
                            </h3>
                            <p className="mt-1 text-sm text-muted">
                                Windows shows this for new apps that are not yet widely downloaded. The installer is
                                safe to keep. Follow the steps below to finish the download.
                            </p>
                        </div>
                    </div>

                    <ol className="mt-6 space-y-5">
                        {/* Step 1 */}
                        <li className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverse">
                                1
                            </span>
                            <div className="text-left">
                                <p className="text-sm font-medium text-foreground">
                                    Open your browser's Downloads panel
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    After clicking "Download for Windows", a warning might appears saying{' '}
                                    <span className="font-medium text-foreground">
                                        "Make sure you trust daily-grades-offline-1.0.0-setup.exe"
                                    </span>
                                    {" "} if didn't ignore this step
                                    .
                                </p>
                            </div>
                        </li>

                        {/* Step 2 with image */}
                        <li className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverse">
                                2
                            </span>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="text-sm font-medium text-foreground">
                                    Click the small arrow next to <span className="font-semibold">Delete</span>, then choose{' '}
                                    <span className="font-semibold">Keep anyway</span>
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    Do not click Delete. The download will complete after you choose Keep anyway.
                                </p>

                                <div className="mt-3 w-full max-w-xs overflow-hidden rounded-lg border border-border">
                                    <img
                                        src={step1}
                                        alt="Browser Downloads panel showing the arrow next to Delete with the Keep anyway option"
                                        className="h-full w-full"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </li>

                        {/* Step 3 */}
                        <li className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverse">
                                3
                            </span>
                            <div className="text-left">
                                <p className="text-sm font-medium text-foreground">
                                    Open the installer. If Windows says "Windows protected your PC", click{' '}
                                    <span className="font-semibold">More info</span> and then{' '}
                                    <span className="font-semibold">Run anyway</span>
                                </p>
                                {/* <p className="mt-1 text-sm text-muted">
                                    This is the same reason as above: the installer is not yet digitally signed.
                                </p> */}
                            </div>
                        </li>
                    </ol>

                    <p className="mt-6 rounded-lg bg-primary-soft px-4 py-3 text-xs text-muted sm:text-sm">
                        Using Chrome? The warning may show a <span className="font-medium text-foreground">Keep</span>{' '}
                        button instead. Click it, and if asked again, confirm with{' '}
                        <span className="font-medium text-foreground">Keep anyway</span>.
                    </p>
                </div>
            </div>
        </section>
    )
}



// 45B6-CC54-11FE-2605 for password change 