import { getThemeScript } from "@teispace/next-themes/server"

export async function ClientScripts() {
  const themeScript = await getThemeScript({
    attribute: "class",
    defaultTheme: "system",
    enableSystem: true,
    disableTransitionOnChange: "true",
  })

  return (
    <>
      <script
        id="theme-script"
        dangerouslySetInnerHTML={{ __html: themeScript }}
      />
    </>
  )
}